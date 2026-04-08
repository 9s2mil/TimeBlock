let currentDate = new Date()
let isEditMode = true
const days = ["일", "월", "화", "수", "목", "금", "토"]
function getDateKey(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getDayKey(date) {
  return date.getDay()
}

function updateTime() {
  const now = new Date()

  const yyyy = currentDate.getFullYear()
  const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
  const dd = String(currentDate.getDate()).padStart(2, '0')
  const day = days[currentDate.getDay()]

  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  const stateText = isEditMode ? "ON" : "OFF"

  document.getElementById("dateText").innerHTML =
    `${yyyy}년 ${mm}월 ${dd}일(${day})<br>
     현재시각 : ${hh}:${min}:${ss}
     <span id="editState" class="${isEditMode ? 'on' : 'off'}">
       ${stateText}
     </span>`
}

function toggleEditMode() {
  isEditMode = !isEditMode

  const table = document.getElementById("table")

  if (isEditMode) {
    table.classList.remove("locked")
  } else {
    table.classList.add("locked")
  }
  updateTime()
}

function prevDay() {
  currentDate.setDate(currentDate.getDate() - 1)
  renderTable()
  updateTime()
}

function nextDay() {
  currentDate.setDate(currentDate.getDate() + 1)
  renderTable()
  updateTime()
}

function goToday() {
  currentDate = new Date()
  renderTable()
  updateTime()
  scrollToCurrentHour()
}

setInterval(updateTime, 1000)

document.getElementById("dateText").addEventListener("click", toggleEditMode)

updateTime()

function createTable() {
  const table = document.getElementById("table")

  const dateKey = getDateKey(currentDate)
  const dayKey = getDayKey(currentDate)

  for (let i = 0; i < 24; i++) {
    const tr = document.createElement("tr")

    const hour = (i + 4) % 24
    const displayHour = String(hour).padStart(2, '0')

    // 👉 시간 컬럼
    const tdTime = document.createElement("td")
    tdTime.className = "timeCell"
    tdTime.innerText = displayHour

    const activeKey = `${dateKey}_active_${i}`

    // 👉 기존 active 불러오기
    if (localStorage.getItem(activeKey) === "1") {
      tr.classList.add("active")
    }

    // 👉 롱프레스 변수
    let pressTimer = null
    let isLongPress = false

    // 👉 터치 시작
    tdTime.addEventListener("touchstart", () => {
      if (!isEditMode) return
      isLongPress = false

      pressTimer = setTimeout(() => {
        isLongPress = true

        // 👉 현재 값 → 루틴 저장
        const input1Val = input1.value
        const input2Val = input2.value

        const routineKey1 = `routine_${dayKey}_cell_${i}_1`
        const routineKey2 = `routine_${dayKey}_cell_${i}_2`

        localStorage.setItem(routineKey1, input1Val)
        localStorage.setItem(routineKey2, input2Val)

        alert("루틴 저장됨")
      }, 500) // 0.5초
    })

    // 👉 터치 끝
    tdTime.addEventListener("touchend", () => {
      if (!isEditMode) return
      clearTimeout(pressTimer)

      // 👉 롱프레스 아니면 클릭 처리
      if (!isLongPress) {
        tr.classList.toggle("active")

        if (tr.classList.contains("active")) {
          localStorage.setItem(activeKey, "1")
        } else {
          localStorage.removeItem(activeKey)
        }
      }
    })

    // 👉 터치 취소 (손가락 이동 등)
    tdTime.addEventListener("touchmove", () => {
      clearTimeout(pressTimer)
    })

    tr.appendChild(tdTime)

    // 👉 입력 1
    const tdInput1 = document.createElement("td")
    const input1 = document.createElement("input")
    input1.type = "text"

    const key1 = `${dateKey}_cell_${i}_1`
    const routineKey1 = `routine_${dayKey}_cell_${i}_1`

    input1.value =
      localStorage.getItem(key1) ??
      localStorage.getItem(routineKey1) ??
      ""

    input1.addEventListener("input", () => {
      if (!isEditMode) return
      localStorage.setItem(key1, input1.value)
    })

    tdInput1.appendChild(input1)
    tr.appendChild(tdInput1)

    // 👉 입력 2
    const tdInput2 = document.createElement("td")
    const input2 = document.createElement("input")
    input2.type = "text"

    const key2 = `${dateKey}_cell_${i}_2`
    const routineKey2 = `routine_${dayKey}_cell_${i}_2`

    input2.value =
      localStorage.getItem(key2) ??
      localStorage.getItem(routineKey2) ??
      ""

    input2.addEventListener("input", () => {
      if (!isEditMode) return
      localStorage.setItem(key2, input2.value)
    })

    tdInput2.appendChild(input2)
    tr.appendChild(tdInput2)

    table.appendChild(tr)
  }
}

function renderTable() {
  document.getElementById("table").innerHTML = ""
  createTable()
  highlightCurrentRow()
}

createTable()
document.getElementById("table").classList.remove("locked")
updateTime()

function scrollToCurrentHour() {
  const now = new Date()
  const currentHour = now.getHours()

  const index = (currentHour - 4 + 24) % 24

  const table = document.getElementById("table")
  const targetRow = table.children[index]

  if (targetRow) {
    targetRow.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
  }
}

scrollToCurrentHour()

function highlightCurrentRow() {
  const now = new Date()
  const currentHour = now.getHours()

  const index = (currentHour - 4 + 24) % 24

  const table = document.getElementById("table")

  Array.from(table.children).forEach(tr => {
    tr.classList.remove("now")
  })

  if (table.children[index]) {
    table.children[index].classList.add("now")
  }
}

highlightCurrentRow()
setInterval(highlightCurrentRow, 60000)
