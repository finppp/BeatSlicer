var navigator = window.navigator;
var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();
var recordBuffer = null;
var peakArray = [];
var bufferSlice1 = null;
var bufferSlice2 = null;
var bufferSlice3 = null;
var bufferSlice4 = null;
var bufferSlice5 = null;
var bufferSlice6 = null;
var slice1 = null;//holds slice array
var slice2 = null;
var slice3 = null;//holds slice array
var slice4 = null;
var slice5 = null;//holds slice array
var slice6 = null;

// audio
var mediaStream;
var rec;//js recorder instance
var mediaStreamSource

navigator.getUserMedia = (
  navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

function record() {
  navigator.getUserMedia({audio: true},
  ///on success
  function(localMediaStream){
    mediaStream = localMediaStream;
    var mediaStreamSource = context.createMediaStreamSource(localMediaStream);
    rec = new Recorder(mediaStreamSource, {workerPath: 'externals/recorderWorker.js'});
    //mediaStreamSource.connect(context.destination);
    rec.record();
  },
  function(err){console.log('Not supported');});
}

function SAS(){
  stopRecord();
  getBuffer();
  setTimeout(getPeaks,1000);
  setTimeout(slicePoints,2000);
  getPeaks();
  slicePoints();
}

function stopRecord() {
  rec.stop();
}

function getBuffer(){
  rec.getBuffer(function getBufferCallback( buffers ) {
    recordBuffer = context.createBuffer( 1, buffers[0].length, context.sampleRate);
    recordBuffer.getChannelData(0).set(buffers[0]);
  });
}

function play(){
  var playNode = context.createBufferSource();
  playNode.buffer = recordBuffer;
  playNode.connect( context.destination );
  playNode.start(0);
}

function getPeaksAtThreshold(data, threshold) {
  
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peakArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 15000;
    }
    i++;
  }
  return peakArray;
}

function getPeaks(){
  peakArray.length  = 0;
  console.log(recordBuffer);
  floatArray = recordBuffer.getChannelData(0);
  
   for (i=1; peakArray.length < 6; i *= 0.9){
    peakArray.length  = 0;
    peakArray = getPeaksAtThreshold(floatArray, i);
    console.log("scan " +i +" = " + peakArray );
   }
}

function slicePoints(){
  var slice1 = floatArray.slice(peakArray[0]-500,peakArray[1]-500);
  bufferSlice1 = context.createBuffer(1, slice1.length , 44100);
  bufferSlice1.copyToChannel(slice1,0,0);
  var slice2 = floatArray.slice(peakArray[1]-500,peakArray[2]-500);
  bufferSlice2 = context.createBuffer(1, slice2.length , 44100);
  bufferSlice2.copyToChannel(slice2,0,0);
  var slice3 = floatArray.slice(peakArray[2]-500,peakArray[3]-500);
  bufferSlice3 = context.createBuffer(1, slice2.length , 44100);
  bufferSlice3.copyToChannel(slice3,0,0);
  var slice4 = floatArray.slice(peakArray[3]-500,peakArray[4]-500);
  bufferSlice4 = context.createBuffer(1, slice2.length , 44100);
  bufferSlice4.copyToChannel(slice4,0,0);
  var slice5 = floatArray.slice(peakArray[4]-500,peakArray[5]-500);
  bufferSlice5 = context.createBuffer(1, slice2.length , 44100);
  bufferSlice5.copyToChannel(slice5,0,0);
}

function playSlice(slice, time){
  var playNode = context.createBufferSource();
  playNode.buffer = slice;
  playNode.connect( context.destination );
  playNode.start(context.currentTime + time);
}


function groove(){
playSlice(bufferSlice1,0);
playSlice(bufferSlice3,0.5);
playSlice(bufferSlice4,0.75);
playSlice(bufferSlice1,1);
playSlice(bufferSlice2,1.5);
playSlice(bufferSlice4,1.75);
playSlice(bufferSlice1,2);
playSlice(bufferSlice5,2.25);
playSlice(bufferSlice2,2.5);
playSlice(bufferSlice5,2.6);
playSlice(bufferSlice1,3);
playSlice(bufferSlice4,3.5);
playSlice(bufferSlice2,3.75);
}