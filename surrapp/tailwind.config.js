/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./surrapp/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    colors: {
      'blue': '#1fb6ff',
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange-light': '#ff7849',
      'green': '#13ce66',
      'yellow': '#ffc82c',
      'gray-dark': '#273444',
      'gray': '#8492a6',
      'gray-light': '#d3dce6',
      'orange-ui': '#ff5800',
      'white': '#ffffff', 
      'black': '#000000',
    },

    fontFamily: {
      'anton' : ['Anton']
    },
  plugins: [],
}
}
