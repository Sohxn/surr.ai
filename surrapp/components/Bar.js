import React, {useEffect} from 'react'
import {View, StyleSheet, Animated} from 'react-native'
import styled from 'nativewind'

const Bar = ({h, color}) => {
    const animatedHeight = new Animated.Value(0)

    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: h,
            duration: 500,
            useNativeDriver: false
        }).start()

    }, [h])

    return (
        <Animated.View
        style={[
            styles.bar,{
                height: animatedHeight,
                backgroundColor: color,
            }
        ]}/>
    )
}

const styles = StyleSheet.create({
    bar: {
        width: 10,
        marginRight: 2,
        borderRadius: 30
    }
})

export default Bar
