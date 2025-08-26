import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { returnOrderRequest } from '../features/order/orderSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ReturnRequestModal = ({ isOpen, onClose, order }) => {
  console.log('order', order)
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to return');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('reason', reason);
      formData.append('comment', comment);
      formData.append('items', JSON.stringify(selectedProducts));
      if (image) {
        formData.append('image', image);
      }
      const result = await dispatch(returnOrderRequest({ orderId: order._id, formData })).unwrap();
      toast.success(result.message || 'Return request submitted successfully');
    } catch (error) {
      console.error('error', error);
      toast.error(error || 'Failed to submit return request');
    } finally {
      setReason('');
      setComment('');
      setImage(null);
      setSelectedProducts([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-slate-200 border border-gray-800 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-100">Request a Return</DialogTitle>
          <DialogDescription className="text-sm text-slate-300">
            Please fill out the form below to request a return for your order.
          </DialogDescription>

        {/* Product selection */}
        <div className="mt-4">
          <Label className="block mb-2 font-medium text-slate-300">Select Product(s) to Return</Label>
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-800">
            {order?.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item._id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`product-${item._id}`}
                    checked={selectedProducts.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts((prev) => [...prev, item]);
                      } else {
                        setSelectedProducts((prev) => prev.filter((pid) => pid._id !== item._id));
                      }
                    }}
                    className="mr-2 accent-emerald-400"
                  />
                  <Label htmlFor={`product-${item._id}`} className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <img
                      src={item.image || "https://via.placeholder.com/32"}
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-slate-400">x{item.quantity}</span>
                    </div>
                  </Label>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-sm">No products found in this order.</div>
            )}
          </div>
        </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right text-slate-300">
              Reason
            </Label>
            <Input
              id="reason"
              value={reason}
              placeholder='Reason for return'
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3 bg-gray-800 text-slate-100 border-gray-700 placeholder:text-slate-400"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right text-slate-300">
              Comment
            </Label>
            <Textarea
              id="comment"
              placeholder='Additional details (optional)'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="col-span-3 bg-gray-800 text-slate-100 border-gray-700 placeholder:text-slate-400"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right text-slate-300">
              Image
            </Label>
            <Input
              id="image"
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="col-span-3 bg-gray-600 text-slate-100 border-gray-700"
            />
          </div>
          <DialogFooter className="pt-3">
            <Button type="button" variant="ghost" onClick={onClose} className="border-gray-700 text-slate-200 hover:bg-gray-400 hover:border-gray-600 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestModal;
