import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const ContactForm = ({ API_BASE_URL }) => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactFormLoading, setContactFormLoading] = useState(false);
  const [contactFormError, setContactFormError] = useState(null);
  const [contactFormSuccess, setContactFormSuccess] = useState(false);

  const handleSubmitContactForm = async (e) => {
    e.preventDefault();
    setContactFormLoading(true);
    setContactFormError(null);
    setContactFormSuccess(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            subject: contactSubject,
            message: contactMessage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);
      setContactFormSuccess(true);
      toast.success(
        <div>
          <strong>Message sent successfully!</strong>
          <div style={{ fontSize: "14px" }}>
            We will get back to you as soon as possible.
          </div>
        </div>,
        { className: "toast-success" }
      );
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactSubject("");
      setContactMessage("");
    } catch (err) {
      console.error("Failed to send email:", err);
      setContactFormError(err.message);
      toast.error(
        <div>
          <strong>Failed to send message.</strong>
          <div style={{ fontSize: "14px" }}>
            Please try again later.
          </div>
        </div>,
        { className: "toast-danger" }
      );
    } finally {
      setContactFormLoading(false);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#111827]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className=" kaushan-script-regular text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-300 mb-3 sm:mb-4 font-serif">
            Contact Us
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-4 sm:mb-6 rounded-full" />
          <p className="kaushan-script-regular2 text-base sm:text-lg text-slate-300 px-2">
          Reach out to us for exclusive deals and premium products.
          </p>
        </div>

        <div className="bg-[#111827] border border-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.2)] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12">
          <form
            onSubmit={handleSubmitContactForm}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="contactName"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="contactName"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-slate-300 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-sm sm:text-base"
                  placeholder="Your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-slate-300  border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-sm sm:text-base"
                  placeholder="your.email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-slate-300  border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-sm sm:text-base"
                  placeholder="+971-XX-XXX-XXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="contactSubject"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="contactSubject"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-slate-300  border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-sm sm:text-base"
                  placeholder="How can we help?"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contactMessage"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Message
              </label>
              <textarea
                rows={4}
                id="contactMessage"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-slate-300 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none resize-none text-sm sm:text-base"
                placeholder="Let us know your fashion and lifestyle needs..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
              ></textarea>
            </div>

            {contactFormError && (
              <p className="text-red-500 text-sm text-center">
                {contactFormError}
              </p>
            )}
            {contactFormSuccess && (
              <p className="text-green-600 text-sm text-center">
                Message sent successfully!
              </p>
            )}

            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-semibold px-8 sm:px-12 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                disabled={contactFormLoading}
              >
                {contactFormLoading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 