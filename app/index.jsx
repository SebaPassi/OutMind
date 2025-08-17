import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import Logo from '../assets/OutMind_Logo.png'

const Home = () => {
  return (
    <View style={styles.container}>
      <Image source={Logo}></Image>
      <Text style={styles.title}>OutMind</Text>
      <Text style={{marginBottom: 30, marginTop: 10}}>Tu app de recordatorios favorita</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18
  },
  img: {
    marginVertical: 20
  }
})