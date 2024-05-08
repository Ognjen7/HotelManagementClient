var host = "https://localhost:";
var port = "44381/";
var hoteliEndpoint = "api/hoteli/";
var lanciEndpoint = "api/lanci/";
var loginEndpoint = "api/authentication/login";
var registerEndpoint = "api/authentication/register";
var formAction = "Create";
var editingId;
var jwt_token;

function loadPage() {
  document.getElementById("topButtons").style.display = "flex";
  loadHoteli();
}

function showLogin() {
  document.getElementById("topButtons").style.display = "none";
  document.getElementById("searchFormDiv").style.display = "none";
  document.getElementById("formDiv").style.display = "none";
  document.getElementById("loginFormDiv").style.display = "block";
  document.getElementById("registerFormDiv").style.display = "none";
  document.getElementById("logout").style.display = "none";
}

function validateRegisterForm(username, email, password, confirmPassword) {
  if (username.length === 0) {
    alert("Username field can not be empty.");
    return false;
  } else if (email.length === 0) {
    alert("Email field can not be empty.");
    return false;
  } else if (password.length === 0) {
    alert("Password field can not be empty.");
    return false;
  } else if (confirmPassword.length === 0) {
    alert("Confirm password field can not be empty.");
    return false;
  } else if (password !== confirmPassword) {
    alert("Password value and confirm password value should match.");
    return false;
  }
  return true;
}

function registerUser() {
  var username = document.getElementById("usernameRegister").value;
  var email = document.getElementById("emailRegister").value;
  var password = document.getElementById("passwordRegister").value;
  var confirmPassword = document.getElementById(
    "confirmPasswordRegister"
  ).value;

  if (validateRegisterForm(username, email, password, confirmPassword)) {
    var url = host + port + registerEndpoint;
    var sendData = { Username: username, Email: email, Password: password };
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendData),
    })
      .then((response) => {
        if (response.status === 200) {
          document.getElementById("registerForm").reset();
          console.log("Successful registration");
          alert("Successful registration");
          showLogin();
        } else {
          console.log("Error occured with code " + response.status);
          console.log(response);
          alert("Error occured!");
          response.text().then((text) => {
            console.log(text);
          });
        }
      })
      .catch((error) => console.log(error));
  }
  return false;
}

// prikaz forme za registraciju
function showRegistration() {
  document.getElementById("topButtons").style.display = "none";
  document.getElementById("searchFormDiv").style.display = "none";
  document.getElementById("formDiv").style.display = "none";
  document.getElementById("loginFormDiv").style.display = "none";
  document.getElementById("registerFormDiv").style.display = "block";
  document.getElementById("logout").style.display = "none";
}

function validateLoginForm(username, password) {
  if (username.length === 0) {
    alert("Username field can not be empty.");
    return false;
  } else if (password.length === 0) {
    alert("Password field can not be empty.");
    return false;
  }
  return true;
}

function loginUser() {
  var username = document.getElementById("usernameLogin").value;
  var password = document.getElementById("passwordLogin").value;

  if (validateLoginForm(username, password)) {
    var url = host + port + loginEndpoint;
    var sendData = { Username: username, Password: password };
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendData),
    })
      .then((response) => {
        if (response.status === 200) {
          document.getElementById("loginForm").reset();
          console.log("Successful login");
          alert("Successful login");
          response.json().then(function (data) {
            console.log(data);
            document.getElementById("info").innerHTML =
              "Prijavljeni korisnik: <b><i>" + data.username + "<i/><b>";
            document.getElementById("logout").style.display = "block";
            document.getElementById("btnLogin").style.display = "none";
            document.getElementById("btnRegister").style.display = "none";
            jwt_token = data.token;
            loadHoteli();
            loadLanciForDropdown();
          });
        } else {
          console.log("Error occured with code " + response.status);
          console.log(response);
          alert("Error occured!");
          response.text().then((text) => {
            console.log(text);
          });
        }
      })
      .catch((error) => console.log(error));
  }
  return false;
}

function loadHoteli() {
  document.getElementById("loginFormDiv").style.display = "none";
  document.getElementById("registerFormDiv").style.display = "none";

  // ucitavanje hotela
  var requestUrl = host + port + hoteliEndpoint;
  console.log("URL zahteva: " + requestUrl);
  var headers = {};
  if (jwt_token) {
    headers.Authorization = "Bearer " + jwt_token;
  }
  console.log(headers);
  fetch(requestUrl, { headers: headers })
    .then((response) => {
      if (response.status === 200) {
        response.json().then(setHoteli);
      } else {
        console.log("Error occured with code " + response.status);
        showError();
      }
    })
    .catch((error) => console.log(error));
}

function setHoteli(data) {
  var container = document.getElementById("data");
  container.innerHTML = "";

  console.log(data);

  // ispis naslova
  var div = document.createElement("div");
  var h1 = document.createElement("h2");
  var headingText = document.createTextNode("Hoteli");
  h1.appendChild(headingText);
  div.appendChild(h1);

  // ispis tabele
  var table = document.createElement("table");
  table.className = "table table-hover";

  var header = createHeader();
  table.append(header);

  var tableBody = document.createElement("tbody");

  for (var i = 0; i < data.length; i++) {
    // prikazujemo novi red u tabeli
    var row = document.createElement("tr");
    // prikaz podataka
    row.appendChild(createTableCell(data[i].naziv));
    row.appendChild(createTableCell(data[i].godinaOtvaranja));
    row.appendChild(createTableCell(data[i].brojSoba));
    row.appendChild(createTableCell(data[i].brojZaposlenih));
    row.appendChild(createTableCell(data[i].lanacHotelaNaziv));

    if (jwt_token) {
      // prikaz dugmadi za izmenu i brisanje
      var stringId = data[i].id.toString();

      var buttonDelete = document.createElement("button");
      buttonDelete.name = stringId;
      buttonDelete.addEventListener("click", deleteHotel);
      buttonDelete.className = "btn btn-danger";
      var buttonDeleteText = document.createTextNode("Delete");
      buttonDelete.appendChild(buttonDeleteText);
      var buttonDeleteCell = document.createElement("td");
      buttonDeleteCell.appendChild(buttonDelete);
      row.appendChild(buttonDeleteCell);
    }
    tableBody.appendChild(row);
  }

  table.appendChild(tableBody);
  div.appendChild(table);

  // prikaz forme
  if (jwt_token) {
    document.getElementById("formDiv").style.display = "block";
    document.getElementById("searchFormDiv").style.display = "block";
  }
  // ispis novog sadrzaja
  container.appendChild(div);
}

function createHeader() {
  var thead = document.createElement("thead");
  var row = document.createElement("tr");
  row.style.backgroundColor = "Yellow";

  row.appendChild(createTableHeaderCell("Naziv"));
  row.appendChild(createTableHeaderCell("Godina otvaranja"));
  row.appendChild(createTableHeaderCell("Broj soba"));
  row.appendChild(createTableHeaderCell("Broj zaposlenih"));
  row.appendChild(createTableHeaderCell("Lanac"));

  if (jwt_token) {
    row.appendChild(createTableHeaderCell("Akcija"));
  }

  thead.appendChild(row);
  return thead;
}

function createTableHeaderCell(text) {
  var cell = document.createElement("th");
  var cellText = document.createTextNode(text);
  cell.appendChild(cellText);
  return cell;
}

function createTableCell(text) {
  var cell = document.createElement("td");
  var cellText = document.createTextNode(text);
  cell.appendChild(cellText);
  return cell;
}

function loadLanciForDropdown() {
  // ucitavanje prodavnica
  var requestUrl = host + port + lanciEndpoint;
  console.log("URL zahteva: " + requestUrl);

  var headers = {};
  if (jwt_token) {
    headers.Authorization = "Bearer " + jwt_token;
  }

  fetch(requestUrl, { headers: headers })
    .then((response) => {
      if (response.status === 200) {
        response.json().then(setLanciInDropdown);
      } else {
        console.log("Error occured with code " + response.status);
      }
    })
    .catch((error) => console.log(error));
}

// metoda za postavljanje podavnica u padajuci meni
function setLanciInDropdown(data) {
  var dropdown = document.getElementById("lanacHotelaNaziv");
  console.log("////////////////////");
  console.log("Data: ", data);
  dropdown.innerHTML = "";
  for (var i = 0; i < data.length; i++) {
    var option = document.createElement("option");
    option.value = data[i].id;
    var text = document.createTextNode(data[i].naziv);
    option.appendChild(text);
    dropdown.appendChild(option);
  }
}

function submitHotelForm() {
  var naziv = document.getElementById("naziv").value;
  var godinaOtvaranja = document.getElementById("godinaOtvaranja").value;
  var brojSoba = document.getElementById("brojSoba").value;
  var brojZaposlenih = document.getElementById("brojZaposlenih").value;
  var lanac = document.getElementById("lanacHotelaNaziv").value;
  var httpAction;
  var sendData;
  var url;

  httpAction = "POST";
  url = host + port + hoteliEndpoint;
  sendData = {
    naziv: naziv,
    godinaOtvaranja: godinaOtvaranja,
    brojSoba: brojSoba,
    brojZaposlenih: brojZaposlenih,
    lanacHotelaId: lanac,
  };

  console.log("Objekat za slanje");
  console.log(sendData);
  var headers = { "Content-Type": "application/json" };
  if (jwt_token) {
    headers.Authorization = "Bearer " + jwt_token;
  }
  fetch(url, {
    method: httpAction,
    headers: headers,
    body: JSON.stringify(sendData),
  })
    .then((response) => {
      if (response.status === 200 || response.status === 201) {
        console.log("Successful action");
        formAction = "Create";
        refreshTable();
      } else {
        console.log("Error occured with code " + response.status);
        alert("Error occured!");
      }
    })
    .catch((error) => console.log(error));
  return false;
}

function searchHoteliByCapacity() {
  var minSearchCapacity = document.getElementById("minSearchCapacity").value;
  var maxSearchCapacity = document.getElementById("maxSearchCapacity").value;

  if (minSearchCapacity === "" || maxSearchCapacity === "") {
    alert("Enter both minimum and maximum prices.");
    return;
  }

  var url = host + port + "api/kapacitet";
  var sendData = {
    Najmanje: parseInt(minSearchCapacity),
    Najvise: parseInt(maxSearchCapacity),
  };

  var headers = { "Content-Type": "application/json" };
  if (jwt_token) {
    headers.Authorization = "Bearer " + jwt_token;
  }

  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(sendData),
  })
    .then((response) => response.json())
    .then((data) => {
      setHoteli(data);
    })
    .catch((error) => console.log(error));
}

function deleteHotel() {
  // izvlacimo {id}
  var deleteID = this.name;
  // saljemo zahtev
  var url = host + port + hoteliEndpoint + deleteID.toString();
  var headers = { "Content-Type": "application/json" };
  if (jwt_token) {
    headers.Authorization = "Bearer " + jwt_token;
  }

  fetch(url, { method: "DELETE", headers: headers })
    .then((response) => {
      if (response.status === 204) {
        console.log("Successful action");
        refreshTable();
      } else {
        console.log("Error occured with code " + response.status);
        alert("Error occured!");
      }
    })
    .catch((error) => console.log(error));
}

function refreshTable() {
  // cistim formu
  document.getElementById("hotelForm").reset();
  // osvezavam
  loadHoteli();
}

function logout() {
  jwt_token = undefined;
  document.getElementById("topButtons").style.display = "flex";
  document.getElementById("info").innerHTML = "";
  document.getElementById("data").innerHTML = "";
  document.getElementById("searchFormDiv").style.display = "none";
  document.getElementById("formDiv").style.display = "none";
  document.getElementById("loginFormDiv").style.display = "block";
  document.getElementById("registerFormDiv").style.display = "none";
  document.getElementById("logout").style.display = "none";
  document.getElementById("btnLogin").style.display = "initial";
  document.getElementById("btnRegister").style.display = "initial";
  loadHoteli();
}

function cancelHotelForm() {
  formAction = "Create";
}
