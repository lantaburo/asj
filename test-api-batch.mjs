const response = await fetch("http://localhost:5555/api/batches", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    programId: "d30c1fe3-f267-4cbd-9299-d59d6599398e",
    classroomId: "",
    startDate: "2026-04-28T12:00",
    endDate: "2026-04-29T12:00",
    quota: "10",
    price: ""
  })
});
const data = await response.json();
console.log(response.status, data);
