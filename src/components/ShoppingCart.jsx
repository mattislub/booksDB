import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { Link } from 'react-router-dom';

export default function ShoppingCart() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity,
    getTotal,
    getItemsCount
  } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col animate-slide-in-right">
        <div className="p-4 bg-[#112a55] text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">סל קניות ({getItemsCount()} פריטים)</h2>
          <button onClick={closeCart} className="hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-xl mb-4">סל הקניות ריק</p>
              <button 
                onClick={closeCart}
                className="text-[#112a55] hover:text-[#1a3c70] font-semibold"
              >
                המשך בקניות
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <img
                  src={item.image_url || `https://via.placeholder.com/100x150.png?text=${encodeURIComponent(item.title)}`}
                  alt={item.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-[#112a55]">{item.title}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{item.author}</p>
                  <p className="text-[#a48327] font-bold">{item.price} ₪</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>סה"כ לתשלום:</span>
              <span>{getTotal()} ₪</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-[#7c1c2c] text-white text-center py-3 rounded-lg hover:bg-[#66121f] transition-colors"
              onClick={closeCart}
            >
              המשך לתשלום
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}