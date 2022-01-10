let count=0,flagCount=0;
let sourceBuffer,sourceBuffer1,ActualSourceurl,ActualSourceurl1,FinalVideosrc,flag=0;

let startTime=[],endTime=[],subText=[];

function addRow()
{
    count++;

    let table=document.getElementById("cue-table");

    let row=document.createElement('tr');
    row.id=count+"row";
    let col1=document.createElement('td');
    let col2=document.createElement('td');
    let col3=document.createElement('td');
    let col4=document.createElement('td');

    col1.innerText=count;

    let col2Text=document.createElement('input');
    col2Text.type="time";
    col2Text.step="1";
    let id2=count+"col2";
    col2Text.id=id2;

    col2.appendChild(col2Text);

    let col3Text=document.createElement('input');
    col3Text.type="time";
    col3Text.step="1";
    let id3=count+"col3";
    col3Text.id=id3;

    col3.appendChild(col3Text);

    let col4Text=document.createElement('textarea');
    col4Text.cols="40";
    col4Text.rows="4";
    col4Text.style.resize="none";
    col4Text.placeholder="Enter subtitle text here";
    let id4=count+"col4";
    col4Text.id=id4;

    col4.appendChild(col4Text);

    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    row.appendChild(col4);

    table.appendChild(row);

    document.getElementById(id2).addEventListener("focusout",function(e){
        let currentId=(e.target.id).charAt(0);
        let temp=parseInt(currentId);
        if(temp>1)
        {
            let prevId=(temp-1)+"col3";
            let prevTime=document.getElementById(prevId).value;
            let currentTime=e.target.value;
            if(currentTime<prevTime)
            {    
                alert("Please Enter correct time");
                e.target.value="0";
            }
            else
            {
                startTime[temp]=e.target.value+",000";
            }
        }
        else
            startTime[temp]=e.target.value+",000";
    });

    document.getElementById(id3).addEventListener("focusout",function(e){
        let currentId=(e.target.id).charAt(0);
        let temp=parseInt(currentId);
        
        let prevId=temp+"col2";
        let prevTime=document.getElementById(prevId).value;
        let currentTime=e.target.value;
        if(currentTime<prevTime)
        {    
            alert("End Time can't be less than start time.");
            e.target.value="0";
        }
        else
        {
            endTime[temp]=e.target.value+",000";
        }
    });

    document.getElementById(id4).addEventListener("focusout",function(e){
        let currentId=(e.target.id).charAt(0);
        let temp=parseInt(currentId);
        subText[temp]=e.target.value;
    });
}

function deleteLast() {
    document.getElementById(count+"row").remove();
    startTime.splice(count,1);
    endTime.splice(count,1);
    subText.splice(count,1);
    count--;
}

function exportSRT() {
    let tempString="";
    for(let i=1;i<startTime.length;i++)
    {
        tempString+=i+"\n"+startTime[i]+" --> "+endTime[i]+"\n"+subText[i]+"\n\n";
    }
    let tempBlob=new Blob([tempString],{type: 'text\plain'});
    let url=URL.createObjectURL(tempBlob);
    let temp=document.createElement('a');
    temp.href=url;
    temp.download="Subtitle.srt";
    temp.click();
}

const getVideo = async (input) => 
{
    let f=input.files[0];
    document.getElementById('vid').src=URL.createObjectURL(f);
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.addEventListener(
        'load',
        async function () {
            // convert image file to base64 string
            //videoSource.src = reader.result
            ActualSourceurl = reader.result;
            flagCount++;
        },
    false
  );
}

function uploadSRT() {
    let tempString="";
    for(let i=1;i<startTime.length;i++)
    {
        tempString+=i+"\n"+startTime[i]+" --> "+endTime[i]+"\n"+subText[i]+"\n\n";
    }
    let tempBlob=new Blob([tempString],{type: 'text\plain'});
    const reader=new FileReader();
    reader.readAsDataURL(tempBlob);
    reader.addEventListener('load',async ()=>{
        ActualSourceurl1=reader.result;
        flagCount++;
        if(flagCount>=2)
            init();
        else
        {
            flagCount--;
            alert("Upload Video");
        }
    },false);
}

const { createFFmpeg } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const fetch_and_load_Video_to_FFmpeg = async () => {
  await ffmpeg.load();
  sourceBuffer = await fetch(ActualSourceurl).then((r) => r.arrayBuffer());
  sourceBuffer1 = await fetch(ActualSourceurl1).then((r) => r.arrayBuffer());
}

const addSub = async (option)=>{
  ffmpeg.FS(
    'writeFile',
    'inputTrim.mp4',
    new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
  )
  ffmpeg.FS(
    'writeFile',
    'infile.srt',
    new Uint8Array(sourceBuffer1, 0, sourceBuffer1.byteLength)
  )
  let SubtitleCommand = `-i inputTrim.mp4 -i infile.srt -c copy -c:s mov_text Output.mp4`;
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