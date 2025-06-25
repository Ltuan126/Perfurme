/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Đảm bảo rằng Tailwind tìm kiếm tất cả các file .html và .js trong thư mục src của bạn
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
