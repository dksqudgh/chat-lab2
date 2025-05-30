//문제제기 
//네트워크 문제, 서버 의도적인 종료, 클라이언트 의도적인 종료, 프록시 문제, 방화벽 문제
//끊김 감지하는 코드 작성 >> 자동으로 재연결 >> 안정적으로 서비스 지원 코드를 작성하기
;(()=>{
  let socket = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECCONNECT_INTERVAL = 3000;
  const reconnectWebSocket = ()=>{
    if(MAX_RECONNECT_ATTEMPTS <= reconnectAttempts){
      console.log('최대 재연결 시도 횟수를 초과했습니다');
      alert('서버와의 연결이 불안정합니다. 페이지를 새로고침 해주세요')
      return
    }
    console.log('재연결 중입니다...');
    reconnectAttempts++;
    try {
      socket = new WebSocket(`ws://${window.location.host}/ws`);
      setupWebSockethandlers();
    } catch (error) {
      console.error('소켓 재연결 실패:', error);
      setTimeout(reconnectWebSocket, RECCONNECT_INTERVAL); //setInterval과 다른 점은 3초 후에 딱 한번만 호출함
    }
  }
  const setupWebSockethandlers = () => {
    socket.onopen = () => {
      console.log('소켓 연결 성공');
      reconnectAttempts = 0;
    }
    socket.onclose = () => { 
      console.log('소켓 연결 종료');
      setTimeout(reconnectWebSocket, RECCONNECT_INTERVAL);
    }
    socket.onerror = (error) => {
      console.log('소켓 연결 에러',error);
    }
    socket.addEventListener('message',handleMessage)
  }
  const handleMessage = (event)=>{
    const {type, payload} = JSON.parse(event.data);
    if(type === 'sync') {
        const { talks:syncChats } = payload;
        Object.keys(syncChats).map(key =>{
          chats.push(syncChats[key].payload)
        })
    }else if(type === 'talk'){
      const talk = payload;
      console.log(talk);
      chats.push(talk);
      console.log(chats);
    }
    drawChats();
  }
  
  let myNickname = prompt('닉네임을 입력하세요','default')
  const title = document.querySelector('#title')
  if(myNickname != null){
    title.innerHTML = `'${myNickname}' 님의 예약 상담`
  }
  socket = new WebSocket(`ws://${window.location.host}/ws`)
  setupWebSockethandlers();



  const formEl = document.querySelector('#form')
  const inputEl = document.querySelector('#input')
  const chatsEl = document.querySelector('#chats')
  const exitBtn = document.querySelector('#exit')
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

    exitBtn.addEventListener('click',(e)=>{
      e.defaultPrevented
      alert('상담을 종료합니다.')
      socket.onclose();
      window.location.href = '/';
      console.log('종료');
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
      chatsEl.scrollTop = chatsEl.scrollHeight;

    }//end of drawChats
})()

