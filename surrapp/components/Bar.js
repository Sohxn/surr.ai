import React, { useEffect } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import styled from 'nativewind'

const Bar = ({ height, color }) => {
    return (
        <View
            style={{
                height: height,
                width: 10,
                backgroundColor: color,
                margin: 1,
            }}
        />
    )
}

export default Bar
