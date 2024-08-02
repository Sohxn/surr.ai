import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind'
import PagerView from 'react-native-pager-view';
import { Buffer } from 'buffer'
import { PermissionsAndroid, Platform } from 'react-native';
// fonts
import { useFonts } from 'expo-font';

import * as SplashScreen from 'expo-splash-screen';
import LiveAudioStream from 'react-native-live-audio-stream'
import axios from 'axios'

const StyledButton = styled(TouchableOpacity)
const StyledView = styled(View)
const StyledPagerView = styled(PagerView)


// preventing splashscreen from auto-hide
SplashScreen.preventAutoHideAsync();

const Bar = ({ height, color }) => {
  return (
    <StyledView
      className={`w-[5px] m-[1px] rounded-full mr-2`} 
      style={{ height: height, backgroundColor: color }}
    />
  );
};


export default function App() {
  const [isStreaming, SetIsStreaming] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [root, setRoot] = useState('~')
  const [qual, setQual] = useState('.')
  const [mod, setMod] = useState('~')
  const [bars, setBars] = useState([])
  const intervalid = useRef(null)

  // update time seconds variable
  useEffect(() => {

    // Update seconds only when isStreaming is true
    if (isStreaming) {
      intervalid.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000); // Update every second
    } else {
      clearInterval(intervalid.current)
      setRoot('~')
      setQual('.')
      setMod('~')
    }
    setBars([])
    // Cleanup function to clear the interval when necessary
    return () => clearInterval(intervalid.current);

  }, [isStreaming]);

  const formatTimeDisplay = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0')
    const sec = String(seconds % 60).padStart(2, '0')
    return `${min} : ${sec}`
  }


  const initialiseAudio = async () => {


    LiveAudioStream?.init({
      sampleRate: 44100,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 9,     // mic input
      bufferSize: 512
    })
  }

  const requestMicrophone = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Permissions',
            message: 'This app needs access to your microphone',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
            buttonNeutral: 'Allow Later'
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('permission granted.. Seting up Libraries');
          console.log(LiveAudioStream)
          await initialiseAudio();
          // success
          console.log("success.. LiveAudioStream initialised")
        } else {
          console.log('permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
  }


  const [isLoaded] = useFonts(
    {
      "roboto": require("./assets/fonts/Roboto-Medium.ttf"),
      "anton": require("./assets/fonts/Anton.ttf"),
      "oswald": require("./assets/fonts/Oswald-Bold.ttf")
    }
  )


  const handleOnLayout = useCallback(async () => {
    if (isLoaded) {
      await SplashScreen.hideAsync();
      await requestMicrophone();
    }
    if (isStreaming) {
      LiveAudioStream.stop()
    }
  }, [isLoaded, isStreaming]);

  // just a final check 
  if (!isLoaded) {
    return null;
  }


  const handleAudioStream = () => {
    if (isStreaming) {
      LiveAudioStream.stop()
    } else {
      LiveAudioStream.on('data', async (data) => {
        const chunk = Buffer.from(data, 'base64')
        try {
          const response = await axios.post('http://13.234.233.95:8080/api/chunks', chunk, {
            headers: {
              'Content-Type': 'audio/pcm',
            },
          });
          // update rms and bars array
          updateBars(response.data["rms"])


          if (response.data["root"] === "" && response.data["quality"] === "" && response.data["modifier"] === "") {
            setRoot("~")
            setQual(".")
            setMod("~")
          } else {
            setRoot(response.data["root"])
            setQual(response.data["quality"])
            setMod(response.data["modifier"])
          }
        } catch (error) {
          console.error('Error sending chunk to backend:', error);
        }
      })
      LiveAudioStream.start()
    }
    SetIsStreaming(!isStreaming)
    setSeconds(0)
  }

  const updateBars = (rmsVal) => {
    const color = rmsVal > 40.0 ? '#ff5800' : '#ffffff'
    setBars((prevBars) => [...prevBars, { height: rmsVal, color }])
    if (bars.length > 50) {
      bars.shift()
    }
  }

  // FRONT END
  return (
    <StyledPagerView className='flex-[1]' initialPage={0}>

      <StyledView key="1" onLayout={handleOnLayout} className="flex-[1] items-center bg-black grid grid-rows-3">

        <StyledView style={styles.shadowProp} className='flex h-[52vh] w-[97vw] rounded-[30px] 
        bg-white 
        grid grid-rows-2'>
          <StyledView className='flex justify-center items-center h-[5vh] w-[30vw] rounded-[15px] border-2 border-orange-ui mt-10 ml-3 absolute'>
            <Text style={{ fontFamily: "roboto" }} className='text-orange-ui text-[3vh]'>surr.ai </Text>
          </StyledView>
          {/* info display area */}
          <StyledView className='flex justify-center items-center h-[50vh]'>
            <Text style={{ fontFamily: "oswald" }} className='text-[8vh]'>{root} {qual} {mod}</Text>
          </StyledView>

          <StyledView className='flex justify-center items-center h-20 mt-5'>
            <StyledView className='w-fit bg-orange-ui rounded-[30px]'>
              <Text style={{ fontFamily: "anton" }} className='text-xl p-3 text-white'>{formatTimeDisplay(seconds)}</Text>
            </StyledView>
          </StyledView>

        </StyledView>


        <StyledView className='h-[40vh] w-[97vw] rounded-2xl mt-[15vh] border-2'>
          <StyledView className='flex-row items-center flex-row-reverse'>
            {bars.map((bar, index) => (
              <Bar key={index} height={bar.height} color={bar.color} />
            ))}
          </StyledView>
        </StyledView>



        <StyledButton style={styles.shadowProp}
          onPress={handleAudioStream}
          className='flex justify-center items-center h-32 w-32
        rounded-full border-none bg-orange-ui mt-auto mb-[5vh]'>
          <Text style={{ fontFamily: "anton" }}
            className="text-2xl text-white">{isStreaming ? 'Stop ' : 'Start '}</Text>
        </StyledButton>

        <StatusBar style="auto" />

      </StyledView>

      {/* PAGE 2 */}
      <StyledView key="2" className="flex-[1] bg-white h-screen w-screen bg-black">
        <StyledView className='flex items-center grid grid-rows-2 h-screen w-screen bg-white'>
          <StyledView className='flex row h-[20vh] items-left justify-center w-screen bg-white'>
            <Text style={{ fontFamily: "anton" }}
              className='text-[5vh] p-3 mt-20 text-black'>Saved Sessions </Text>
          </StyledView>

          <StyledView className='flex row h-[100vh] items-center w-screen bg-black rounded-[45px]'>
            {/* list of sessions */}
            <StyledView className='flex h-[20vh] w-[90vw] bg-orange-ui rounded-[40px] m-5'>
              <StyledView className='flex rounded-full h-fit w-20 items-center bg-white m-4'>
                <Text className='text-xl font'>S1 </Text>
              </StyledView>

              <StyledView className='flex rounded-full h-fit w-20 items-center bg-white m-4'>
                <Text className='text-xl'>S1 </Text>
              </StyledView>
            </StyledView>


          </StyledView>
        </StyledView>
      </StyledView>

    </StyledPagerView>
  );
}

// custom styles (not nativewind)
const styles = StyleSheet.create({
  shadowProp: {
    // for ios
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // for android 
    elevation: 8
  },

})
