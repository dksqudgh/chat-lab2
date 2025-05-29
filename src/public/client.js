//alert('client.js loaded....')
//브라우저 개발 도구에서 socket객체를 직접 호출하면 외부에 노출 위험이 있다.
//즉시 실행 함수로 처리함. - IIFE - 바로 정의해서 호출하는 함수
;(()=>{
  let myNickname = prompt('닉네임을 입력하세요','default')
  const title = document.querySelector('#title')
  if(myNickname != null){
    title.innerHTML = `{{${myNickname}}}님의 예약 상담`
  }
  const socket = new WebSocket(`ws://${window.location.host}/ws`)
  const formEl = document.querySelector('#form')
  const inputEl = document.querySelector('#input')
  const chatsEl = document.querySelector('#chats')
  
  
  
  
  
  
  if(!formEl || !inputEl || !chatsEl){ // | 나 || 결과는 같다 차이는 첫조건이 false일때 |는 뒤에도 확인하고 ||는 뒤에는 확인 안한다.
    throw new Error('formEl or inputEl or chatsEl is null')
  }
  const chats = [] //서버에서 보내준 정보를 담는 배열이다. 청취한 정보가 담긴다.
  //청취하기는 onmessage 이벤트 핸들러 처리한다.

  //사용자가 입력한 메시지를 보내는 것은 submit에서 한다
  formEl.addEventListener('submit',(e)=>{
    e.preventDefault()
    //데이터를 직렬화 하는 방법은 여러가지가 있는데 가장 쉬운 방법이 JSON.stringify()를 사용하는 것이다.
    //아래 send 함수는 string이나 버퍼류, Blob,등만 전달할 수 있다.
    //그래서 문자열로 변환해서 전달해야 한다. JSON.stringify() , JSON.parse()
    //데이터를 object로 직접 보낼 수가 없다.
    //데이터를 소켓통신으로 전송하기 전에 JSON.stringify()로 감싸주는것 이것도 전처리 이다.
    socket.send(JSON.stringify({ 
      nickname: myNickname,
      message: inputEl.value})) //서버측 출력
      inputEl.value = '' //입력창 비우기(후처리)
    })

    
    //화면과 로직은 분리한다.
    const drawChats = () => {
      chatsEl.innerHTML = ''; // 현재 대화 목록을 비운다
      //div안에 새로운 div를 만들어서 채운다. <div><div>안쪽에 입력된다</div></div>
      //[키위]:안녕(12:37:50)
      chats.forEach(({message, nickname, time}) => {
        const div = document.createElement('div'); //div를 생성한다.
        div.innerText = `${nickname}: ${message} [${time}]`;
        //바깥쪽 div에 안쪽 div를 추가한다. - appendChild
        chatsEl.appendChild(div);
      })
    }//end of drawChats

    //파라미터 자리는 사용자가 입력한 값을 담는 자리이다
    //누가 넣어주나? 아래 이벤트는 소켓통신이 호출하는 콜백함수이다.
    //콜백함수는 개발자가 직접 호출하는 것이 아니라 이벤트가 발생했을 때 시스템에서 자동으로 호출된다.
    socket.addEventListener('message', (event)=> {
      //아래 조건문에서 사용하는 type은 어디서 가져올까요
      const { type,payload} = JSON.parse(event.data); //서버에서 보내준 데이터는 JSON.stringify()로 감싸져 있다.
      /*
      console.log(type);
      console.log(payload);
      console.log(payload.nickname);
      console.log(payload.time);
      console.log(payload.message);
      */
    
      if('sync' === type){
        const { talks:syncedChats } = payload;
        Object.keys(syncedChats).map(key =>{
          chats.push(syncedChats[key].payload)
        })
      }else if('talk' === type){
        const talk = payload;
        console.log(talk);
        console.log(JSON.stringify(talk));  
        chats.push(talk);
        console.log(chats);
      }
      
      chats.push(JSON.parse(event.data))//청취한 메시지를 배열에 담는다.
      chatsEl.innerHTML = '' //화면 초기화
      chats.forEach(({nickname, message}) => {//배열에 담긴 여러 메시지를 출력한다
        const div = document.createElement('div')
        div.innerText = `${nickname}: ${message}[12:34]`
        chatsEl.appendChild(div)
      })//end of event listener
    })
    drawChats();
})()

