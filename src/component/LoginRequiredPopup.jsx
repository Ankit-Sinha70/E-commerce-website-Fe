import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LoginRequiredPopup({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onClose();
    navigate("/login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f172a] text-gray-300 border border-blue-500 rounded-lg p-6 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-2">Login Required</DialogTitle>
          <DialogDescription className="text-center text-gray-400 mb-4">
            You need to be logged in to proceed to checkout.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <Button onClick={handleLoginClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 