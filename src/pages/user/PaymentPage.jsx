// File: src/pages/PaymentPage.jsx
import React from 'react';

const PaymentPage = () => {
  return (
    <div className="pt-24 max-w-lg mx-auto border rounded shadow p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Paiement Sécurisé</h2>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <p><strong>Marchand:</strong> EDITIONS THISA</p>
        <p><strong>Référence:</strong> 0000016918</p>
        <p><strong>Montant:</strong> 13,00 EUR</p>
      </div>

      <p className="font-semibold mb-2">Sélectionnez un moyen de paiement :</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["cb.png", "visa.png", "mastercard.png", "paylib.png", "ebleue.png"].map((src, idx) => (
          <div
            key={idx}
            className="border-2 border-gray-300 rounded p-2 cursor-pointer hover:border-blue-600 hover:bg-blue-50"
          >
            <img src={`/src/${src}`} alt={src.split('.')[0]} className="h-10 mx-auto" />
          </div>
        ))}
      </div>

      <button
        onClick={() => alert('Redirection vers la passerelle de paiement...')}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Payer maintenant
      </button>
    </div>
  );
};

export default PaymentPage;
