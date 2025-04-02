// 날짜 포맷 함수
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// 입력 필드 유효성 검사
function validateDate(dateString) {
  if (!dateString) return true; // 빈 값은 허용
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

async function getUser() {
  // 로딩 시 사용자 가져오는 함수
  try {
    const res = await axios.get("/users");
    const users = res.data;
    const list = document.getElementById("list");
    list.innerHTML = "";
    // 사용자마다 반복적으로 화면 표시 및 이벤트 연결
    users.forEach(function (user) {
      const userDiv = document.createElement("div");
      userDiv.className = "user-item";

      // 죄수 정보 생성
      const infoDiv = document.createElement("div");
      infoDiv.className = "user-info";
      
      const nameSpan = document.createElement("span");
      nameSpan.className = "user-name";
      nameSpan.textContent = user.name;
      
      const birthSpan = document.createElement("span");
      birthSpan.className = "user-date";
      birthSpan.textContent = `출생: ${formatDate(user.birth)}`;
      
      const gojailSpan = document.createElement("span");
      gojailSpan.className = "user-date";
      gojailSpan.textContent = `입소: ${formatDate(user.gojail)}`;
      
      const outjailSpan = document.createElement("span");
      outjailSpan.className = "user-date";
      outjailSpan.textContent = `출소: ${formatDate(user.outjail)}`;
      
      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(birthSpan);
      infoDiv.appendChild(gojailSpan);
      infoDiv.appendChild(outjailSpan);
      
      // 버튼 영역 생성
      const buttonDiv = document.createElement("div");
      buttonDiv.className = "user-buttons";
      
      const edit = document.createElement("button");
      edit.textContent = "수정";
      edit.addEventListener("click", async () => {
        // 수정 버튼 클릭
        const name = prompt("이름을 입력하세요:", user.name);
        if (!name) {
          return alert("이름을 반드시 입력하셔야 합니다");
        }
        
        const birth = prompt("출생일을 입력하세요 (YYYY-MM-DD):", user.birth ? user.birth.split('T')[0] : '');
        if (birth && !validateDate(birth)) {
          return alert("날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력해주세요.");
        }
        
        const gojail = prompt("입소일을 입력하세요 (YYYY-MM-DD):", user.gojail ? user.gojail.split('T')[0] : '');
        if (gojail && !validateDate(gojail)) {
          return alert("날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력해주세요.");
        }
        
        const outjail = prompt("출소일을 입력하세요 (YYYY-MM-DD):", user.outjail ? user.outjail.split('T')[0] : '');
        if (outjail && !validateDate(outjail)) {
          return alert("날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력해주세요.");
        }
        
        try {
          await axios.put("/user/" + user.id, { name, birth, gojail, outjail });
          getUser();
        } catch (err) {
          console.error(err);
          alert("수정 중 오류가 발생했습니다.");
        }
      });
      
      const remove = document.createElement("button");
      remove.textContent = "삭제";
      remove.addEventListener("click", async () => {
        // 삭제 버튼 클릭
        if (confirm(`${user.name} 죄수 기록을 삭제하시겠습니까?`)) {
          try {
            await axios.delete("/user/" + user.id);
            getUser();
          } catch (err) {
            console.error(err);
            alert("삭제 중 오류가 발생했습니다.");
          }
        }
      });
      
      buttonDiv.appendChild(edit);
      buttonDiv.appendChild(remove);
      
      userDiv.appendChild(infoDiv);
      userDiv.appendChild(buttonDiv);
      list.appendChild(userDiv);
    });
  } catch (err) {
    console.error(err);
    alert("데이터를 불러오는 중 오류가 발생했습니다.");
  }
}

window.onload = getUser; // 화면 로딩 시 getUser 호출

// 폼 제출(submit) 시 실행
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = e.target.username.value;
  const birth = e.target.birth.value;
  const gojail = e.target.gojail.value;
  const outjail = e.target.outjail.value;
  
  if (!name) {
    return alert("이름을 입력하세요");
  }
  
  // 날짜 입력값 검증
  if ((birth && !validateDate(birth)) || 
      (gojail && !validateDate(gojail)) || 
      (outjail && !validateDate(outjail))) {
    return alert("날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력해주세요.");
  }
  
  try {
    await axios.post("/user", { name, birth, gojail, outjail });
    getUser();
    
    // 입력 필드 초기화
    e.target.username.value = "";
    e.target.birth.value = "";
    e.target.gojail.value = "";
    e.target.outjail.value = "";
  } catch (err) {
    console.error(err);
    alert("등록 중 오류가 발생했습니다.");
  }
});