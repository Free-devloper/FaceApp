import * as FaceDetector from 'expo-face-detector';

import React,{useEffect, useRef, useState} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Camera } from 'expo-camera'
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [permission,set_permission]=useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [faces,setfaces]=useState({faces:{},facedetected:false})
  const [name,setname]=useState('')
  let camera_ref=useRef();
 function predict(file){
  // extract the filetype
  let uri=file.uri
  let fileType = uri.substring(uri.lastIndexOf(".") + 1);
  let formData = new FormData();

  formData.append("file", {
    uri,
    name: `file.${fileType}`,
    type: `image/${fileType}`
  });

  let options = {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data"
    }
  };
  fetch('http://07f7-111-68-97-205.ngrok.io/predict', options).then(response => response.text())
  .then(result =>{
    result.replace('"','')
    setname(result) 
    console.log(result)})
.catch(error =>{ 
  setname('')
  console.log('error', error)});
  } 
  async function checkpermission(){
    const { status } =await Camera.requestCameraPermissionsAsync();
   set_permission({permission:status==='granted'})
  }
  useEffect(() => {
    checkpermission()
    return () => {
    }
  }, [])
  if (permission === null) {
    return <View />;
  }else{
  return (
    <>
    <View style={styles.container}>
      <Camera style={styles.camera} 
      ref={ref=>camera_ref=ref}
      faceDetectorSettings={{
        mode: FaceDetector.Constants.Mode.accurate,
        detectLandmarks: FaceDetector.Constants.Landmarks.all,
        runClassifications: FaceDetector.Constants.Classifications.all,
        minDetectionInterval: 1000,
        tracking:true
   }}
      onFacesDetected={async(face)=>{
      if(face.faces.length>0){
        old_face=faces
        setfaces({...faces,faces:face.faces[0],facedetected:true})
        if(old_face.faces.faceID!==face.faces[0].faceID){
          console.log(faces.faces.faceID,face.faces.faceID)
         let photo= await camera_ref.takePictureAsync({base64:false});
         predict(photo);
         console.log(photo)
        }else{
        // let photo= await camera_ref.takePictureAsync({base64:false});
        //  console.log(photo)
        }
        // setfaces({...faces,faces:face.faces[0],facedetected:true})
        console.log(face);
      }else{
        setfaces({...faces,facedetected:false})
      }}}
      type={type}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
    {faces.facedetected&&
    <View
  style={{
    position: 'absolute',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    width: Object.getOwnPropertyNames(faces.faces).length != 0 ? faces.faces.bounds.size.width : '0%',
    height:Object.getOwnPropertyNames(faces.faces).length != 0  ? faces.faces.bounds.size.height : '0%',
    top:Object.getOwnPropertyNames(faces.faces.bounds.origin).length != 0 ? faces.faces.bounds.origin.y : '0',
    left: Object.getOwnPropertyNames(faces.faces.bounds.origin).length != 0 ? faces.faces.bounds.origin.x : '0',
    borderColor: '#33FF33',
    borderWidth: 5,
    borderStyle: 'dashed',
    display:faces.facedetected==true ? 'flex' :'none'
  }}>
</View>}
    <View style={styles.container2}>
     {/* {!faces.facedetected&&<Text>Not Smiling</Text>} */}
     {faces.facedetected==true && faces.faces.smilingProbability>0.50&&<Text>Smiling</Text>}
     {faces.facedetected==true&&<Text>{name}</Text>}
      {/* <Text>{faces!={}? faces.faceID :'Nothing'}</Text> */}
    </View>
  </>
  );
  }
}

const styles = StyleSheet.create({
  container2:{
    flex:1
  },
  container: {
    flex: 4,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

