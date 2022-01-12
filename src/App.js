let videoSource=document.getElementById('video');
let subSource=document.getElementById('subtitle');

let sourceBuffer,sourceBuffer1,ActualSourceurl,ActualSourceurl1,FinalVideosrc,flag=0,type;

const { createFFmpeg } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const fetch_and_load_Video_to_FFmpeg = async () => {
  await ffmpeg.load();
  sourceBuffer = await fetch(ActualSourceurl).then((r) => r.arrayBuffer());
  sourceBuffer1 = await fetch(ActualSourceurl1).then((r) => r.arrayBuffer());
}

const get_video_source_from_input = async (input) => {
  let VideoSourceFile = input.files[0];
  
  const reader = new FileReader();
  reader.readAsDataURL(VideoSourceFile);
  reader.addEventListener(
    'load',
    async function () {
      // convert image file to base64 string
      //videoSource.src = reader.result
      ActualSourceurl = reader.result;
      flag++;
    },
    false
  );
}

const get_sub = async (input) => {
  let VideoSourceFile = input.files[0];
  if(VideoSourceFile.length>0)
  {
    let tempType=(VideoSourceFile.name).split('.');
    type=tempType[tempType.length-1];
  }
  const reader = new FileReader();
  reader.readAsDataURL(VideoSourceFile);

  reader.addEventListener(
    'load',
    async function () {
      ActualSourceurl1 = reader.result;
      flag++;
    },
    false
  );
}

const addSub = async (option)=>{
  ffmpeg.FS(
    'writeFile',
    'inputTrim.mp4',
    new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
  )
  ffmpeg.FS(
    'writeFile',
    'infile.'+type,
    new Uint8Array(sourceBuffer1, 0, sourceBuffer1.byteLength)
  )
  let SubtitleCommand = `-i inputTrim.mp4 -i infile.`+type+` -map 0 -c copy -c:s mov_text Output.mp4`;
  let ArrayofInstructions = SubtitleCommand.split(' ');
  await ffmpeg.run(...ArrayofInstructions);
}

let handleDownload = (src) => {
  let tempLink = document.createElement('a');
  tempLink.href = src;
  tempLink.download = 'SubtitledVideo.mp4';
  tempLink.click();
  setTimeout(() => {
      window.location.href = "../404.html";
  }, 500);
}

const Render_edited_video = async () => {
  const outputActual = await ffmpeg.FS('readFile', 'Output.mp4');

  let blobUrlActual = URL.createObjectURL(
    new Blob([outputActual.buffer], { type: 'video/mp4' })
  );
  FinalVideosrc = blobUrlActual;
}

async function init() {
    await fetch_and_load_Video_to_FFmpeg();
    await addSub();
    await Render_edited_video();
    handleDownload(FinalVideosrc);
}

let timer=setInterval(()=>{
  if(flag==2)
  {
    init();
    clearInterval(timer);
  }
},2000);
