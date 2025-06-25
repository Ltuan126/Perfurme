// src/components/About.js
import React from 'react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-4xl font-bold text-pink-600 mb-6">About Perfume Shop</h1>

      <section className="mb-10">
        <p className="text-lg leading-7">
          Welcome to <span className="font-semibold">Perfume Shop</span> — where passion meets fragrance.
          We are dedicated to bringing you the finest selection of premium perfumes from around the world.
          Every scent is carefully curated to help you express your style, your personality, and your story.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Our Mission</h2>
        <p className="leading-7">
          Our mission is to inspire confidence through scent. We believe that the right perfume can uplift your mood,
          mark special memories, and leave a lasting impression.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Our Vision</h2>
        <p className="leading-7">
          To become the leading online destination for perfume lovers in Vietnam and beyond —
          offering authentic products, seamless experiences, and personal connections through fragrance.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6">
          {[
            { name: 'Lê Tuấn', role: 'Founder & Perfume Expert' },
            { name: 'Ngọc Mai', role: 'Creative Director' },
            { name: 'Minh Đạt', role: 'Customer Success' },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="h-24 w-24 mx-auto bg-pink-100 rounded-full mb-4" />
              <h3 className="text-lg font-semibold text-center">{member.name}</h3>
              <p className="text-sm text-center text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
