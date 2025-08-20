import { Text, View, Image } from 'react-native'
import React from 'react'
import Logo from '../assets/OutMind_Logo.png'
import "../global.css"
import { Link } from 'expo-router'

const Home = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Image source={Logo} className="my-5 w-32 h-32" />

      <Text className="font-bold text-lg">OutMind</Text>

      <Text className="mb-8 mt-2.5 text-gray-600">Never forget what matters.</Text>

      <Link 
        href="/home" 
        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg mb-4 w-64 text-center shadow-lg"
      >
        Sign Up / Sign In
      </Link>

      <Link 
        href="/about" 
        className="mb-4 bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-lg border border-gray-300 w-64 text-center"
      >
        About Page
      </Link>

      <Link 
        href="/contact" 
        className="bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-lg border border-gray-300 w-64 text-center"
      >
        Contact Us
      </Link>
    </View>
  )
}

export default Home