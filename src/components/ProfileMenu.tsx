import { useState } from 'react';
import { LogOut } from 'lucide-react'; // Assuming you're using an icon package like lucide-react

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Profile Icon (like a Google photo icon) */}
      <button className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
        {/* Replace this with an actual profile image */}
        <img
          src="https://via.placeholder.com/40" 
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <LogOut />
              <span>Logout</span>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <LogOut />
              <span>Profile</span>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <LogOut />
              <span>Settings</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

