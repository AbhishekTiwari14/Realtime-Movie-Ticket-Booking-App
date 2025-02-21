import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  arrayUnion,
  addDoc,
  collection,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { useLocation, useNavigate } from "react-router-dom"
import { bookSeats } from "@/lib/bookSeats"
import PaymentTimer from "./PaymentTimer"
import toast from "react-hot-toast"

type PaymentMethod = "upi" | "card" | "netbanking"

const PaymentSimulation = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState<boolean>(false)
  const [method, setMethod] = useState<PaymentMethod>("upi")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [transactionId, setTransactionId] = useState<string>("")
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const location = useLocation()
  const { amount, movieTitle, date, theater, seats, showtime, docId } =
    location.state

  // Form fields
  const [upiId, setUpiId] = useState<string>("")
  const [cardNumber, setCardNumber] = useState<string>("")
  const [cardExpiry, setCardExpiry] = useState<string>("")
  const [cardCvv, setCardCvv] = useState<string>("")
  const [cardName, setCardName] = useState<string>("")
  const [bankName, setBankName] = useState<string>("")
  const [savePaymentMethod, setSavePaymentMethod] = useState<boolean>(false)
  const navigate = useNavigate()
  const userId = currentUser?.uid

  const onPaymentSuccess = async () => {
    const bookingData = {
      bookings: arrayUnion({
        movieTitle,
        showtime,
        date,
        theater,
        seats,
        amount,
        paymentStatus: "paid",
        paymentMethod: method,
        paymentId: localStorage.getItem("currentPaymentId") || transactionId,
        createdAt: new Date().toISOString(),
        bookingId: transactionId,
      }),
    }

    await toast.promise(
      Promise.all([
        setDoc(doc(db, "bookings", userId), bookingData, { merge: true }),
        bookSeats(docId, seats, "booked"),
      ]),
      {
        loading: "Booking your tickets...",
        success: () => {
          setTimeout(() => {
            navigate("/")
          }, 1000)
          return "Tickets Booked Successfully!"
        },
        error: "Booking Failed",
      }
    )
  }

  const onPaymentFailure = (errorMessage: string) => {
    toast.error(`Payment Failed: ${errorMessage}`)
    const timeout = setTimeout(() => {
      navigate(`/`)
    }, 1000)

    return () => clearTimeout(timeout)
  }

  useEffect(() => {
    setTransactionId(`SIM_${Date.now()}_${Math.floor(Math.random() * 1000)}`)
  }, [])

  const handleMethodChange = (value: string) => {
    setMethod(value as PaymentMethod)
  }

  const validatePaymentDetails = (): boolean => {
    if (method === "upi") {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
      return upiRegex.test(upiId)
    } else if (method === "card") {
      return (
        cardNumber.length >= 15 &&
        cardExpiry.length === 5 &&
        cardCvv.length >= 3 &&
        cardName.length > 3
      )
    } else if (method === "netbanking") {
      return bankName !== ""
    }
    return false
  }

  const initiatePayment = async () => {
    if (!validatePaymentDetails()) {
      setPaymentStatus("Please fill all required fields correctly")
      return
    }

    try {
      setLoading(true)
      setPaymentStatus("Initiating payment...")

      console.log("Starting payment initiation for user:", userId)

      if (!userId) {
        throw new Error("User ID is not available")
      }

      const paymentData = {
        amount,
        userId,
        transactionId,
        status: "initiated",
        createdAt: serverTimestamp(),
        paymentMethod: method,
        movieTitle,
        showtime,
        date,
        theater,
        seats,
      }

      if (method === "upi") {
        Object.assign(paymentData, { upiId })
      } else if (method === "card") {
        Object.assign(paymentData, {
          cardNumberLast4: cardNumber.slice(-4),
          cardType: getCardType(cardNumber),
          cardName,
        })
      } else if (method === "netbanking") {
        Object.assign(paymentData, { bankName })
      }

      console.log("Creating payment record:", paymentData)

      const paymentRef = await addDoc(collection(db, "payments"), paymentData)
      console.log("Payment record created with ID:", paymentRef.id)

      localStorage.setItem("currentPaymentId", paymentRef.id)
      setModalOpen(true)
      setPaymentStatus("")
      setLoading(false)
    } catch (error) {
      console.error("Detailed error in payment initiation:", error)
      setPaymentStatus("Failed to initiate payment")
      setLoading(false)
      if (error instanceof Error) {
        onPaymentFailure(error.message)
      } else {
        onPaymentFailure("Unknown error occurred during payment initiation")
      }
    }
  }

  const confirmPayment = async () => {
    setModalOpen(false)
    setLoading(true)

    try {
      const paymentId = localStorage.getItem("currentPaymentId")
      if (!paymentId) throw new Error("Payment reference not found")

      await updateDoc(doc(db, "payments", paymentId), {
        status: "completed",
        completedAt: serverTimestamp(),
      })

      setPaymentStatus("Payment successful!")
      await onPaymentSuccess()
    } catch (error) {
      console.log(error)
      setPaymentStatus("Payment processing failed after confirmation")
      if (error instanceof Error) {
        onPaymentFailure(error.message)
      } else {
        onPaymentFailure("Unknown error occurred during payment confirmation")
      }
    } finally {
      setLoading(false)
      localStorage.removeItem("currentPaymentId")
    }
  }

  const cancelPayment = async () => {
    setModalOpen(false)

    try {
      const paymentId = localStorage.getItem("currentPaymentId")
      if (paymentId) {
        await updateDoc(doc(db, "payments", paymentId), {
          status: "cancelled",
          cancelledAt: serverTimestamp(),
          failureReason: "User cancelled",
        })
      }

      setPaymentStatus("Payment cancelled")
      onPaymentFailure("Payment cancelled by user")
      navigate("/")
    } catch (error) {
      console.error("Error cancelling payment:", error)
    } finally {
      localStorage.removeItem("currentPaymentId")
    }
  }

  const getCardType = (number: string): string => {
    if (number.startsWith("4")) return "Visa"
    if (/^5[1-5]/.test(number)) return "Mastercard"
    if (/^3[47]/.test(number)) return "American Express"
    if (/^6(?:011|5)/.test(number)) return "Discover"
    return "Unknown"
  }

  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4)
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2)}`
    }
    return v
  }

  return (
    <Card className="max-w-lg mx-auto mt-8 p-6">
      <CardHeader>
        <CardTitle className="text-center">Payment (Simulation)</CardTitle>
      </CardHeader>

      <PaymentTimer docId={docId} seats={seats} />

      <CardContent>
        <div className="space-y-1 mb-4">
          <p className="text-sm">Movie: {movieTitle}</p>
          <p className="text-lg font-semibold mt-4 mb-6">Amount: ₹{amount}</p>
        </div>

        <Tabs
          defaultValue="upi"
          className="w-full mb-6"
          value={method}
          onValueChange={handleMethodChange}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upi">UPI</TabsTrigger>
            <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
            <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
          </TabsList>

          <TabsContent value="upi" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiId">Enter UPI ID</Label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUpiId(e.target.value)
                  }
                  placeholder="username@upi"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  e.g. yourname@okicici, name@paytm, username@ybl
                </p>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="saveUpiMethod"
                  checked={savePaymentMethod}
                  onCheckedChange={(checked: boolean) =>
                    setSavePaymentMethod(checked === true)
                  }
                  disabled={loading}
                />
                <label
                  htmlFor="saveUpiMethod"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Save this payment method for future use
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCardNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 16)
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry Date</Label>
                  <Input
                    id="cardExpiry"
                    value={cardExpiry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCardExpiry(formatCardExpiry(e.target.value))
                    }
                    placeholder="MM/YY"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input
                    id="cardCvv"
                    type="password"
                    value={cardCvv}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="123"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCardName(e.target.value)
                  }
                  disabled={loading}
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="saveCardMethod"
                  checked={savePaymentMethod}
                  onCheckedChange={(checked: boolean) =>
                    setSavePaymentMethod(checked === true)
                  }
                  disabled={loading}
                />
                <label
                  htmlFor="saveCardMethod"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Save this payment method for future use
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="netbanking" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankSelect">Select Bank</Label>
                <Select
                  value={bankName}
                  onValueChange={setBankName}
                  disabled={loading}
                >
                  <SelectTrigger id="bankSelect">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SBI">State Bank of India</SelectItem>
                    <SelectItem value="HDFC">HDFC Bank</SelectItem>
                    <SelectItem value="ICICI">ICICI Bank</SelectItem>
                    <SelectItem value="Axis">Axis Bank</SelectItem>
                    <SelectItem value="Kotak">Kotak Mahindra Bank</SelectItem>
                    <SelectItem value="BOB">Bank of Baroda</SelectItem>
                    <SelectItem value="PNB">Punjab National Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 mb-4">
          <Button
            className="w-full"
            onClick={initiatePayment}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ₹${amount}`
            )}
          </Button>
        </div>

        {paymentStatus && (
          <p
            className={`text-center text-sm mt-4 ${
              paymentStatus.includes("successful")
                ? "text-green-600"
                : paymentStatus.includes("cancelled") ||
                  paymentStatus.includes("failed")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {paymentStatus}
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground mt-4">
          Transaction ID: {transactionId}
        </p>

        <p className="text-xs text-center text-muted-foreground mt-2">
          This is a simulated payment system for testing purposes only.
        </p>
      </CardContent>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => !open && cancelPayment()}
      >
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="Payment Simulation"
        >
          <DialogHeader>
            <DialogTitle>Payment Simulation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm">
              Simulating payment for ₹{amount} to Movie Booking App
            </p>
            <p className="text-xs text-muted-foreground">
              Reference: {transactionId}
            </p>
            <p className="text-sm mt-4">
              Payment Method:{" "}
              {method === "upi"
                ? "UPI"
                : method === "card"
                ? "Credit/Debit Card"
                : "Net Banking"}
              {method === "upi" && ` (${upiId})`}
              {method === "card" &&
                ` (${getCardType(cardNumber)} ending in ${cardNumber.slice(
                  -4
                )})`}
              {method === "netbanking" && ` (${bankName})`}
            </p>
            <p className="text-sm mt-4">
              In a real app, you would:
              {method === "upi" &&
                " be redirected to your UPI app or see a QR code."}
              {method === "card" &&
                " be directed to a secure payment page to enter OTP."}
              {method === "netbanking" &&
                " be redirected to your bank's login page."}
            </p>
            <p className="text-sm mt-4">
              For this simulation, please select an option below:
            </p>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={cancelPayment}>
              Cancel Payment
            </Button>
            <Button variant="default" onClick={confirmPayment}>
              Simulate Successful Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default PaymentSimulation
