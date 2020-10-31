var auth_token = '';
const container = document.getElementById('container-fluid');
const content = document.getElementById('content')
const loader = document.createElement('div');
loader.classList.add('loader');

function addListeners() {
	document.querySelectorAll("button.applyuser").forEach(function(elem) {
		elem.addEventListener("click", async function() {
      viewLoader();
      const response = await postData('/allowaccess', {auth_token, tgid: elem.id});
      const resp = await response.json();
      if (response.status === 200) {
        infoView('content', resp.message, 'green')
        const qItems = document.getElementById('queueItems');
        const item = document.getElementById(elem.id + '_row');
        qItems.removeChild(item);
      }
      else {
        infoView('content', resp.message, 'red')
      }
      hideLoader();
		});
	});
}

async function auth(s, e) {
  try{
    viewLoader();
    const login = document.getElementById('login');
    const pass = document.getElementById('password');
    const response = await postData('/auth', {login: login.value, password: pass.value});

    if (response.status === 200) {
      const resp = await response.json();
      auth_token = resp.auth;
      const table = queueView(JSON.parse(resp.data));
      const loginForm = document.getElementById('loginForm');
      content.removeChild(loginForm);
      content.innerHTML += table;
      addListeners();
    }
    else {
      infoView('loginForm', 'Неверный логин и/или пароль', 'red');
    }
  }
  catch(e) {
    alert('ERROR: ->' + e)
  }
  finally {
    hideLoader();
  }
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response;
}
  

const infoView = (elementToAppend, errorMessage, color) => {
  const el = document.createElement('p');
  el.textContent = errorMessage;
  el.style = `color: ${color}; margin-top: 10px`;
  const loginForm = document.getElementById(elementToAppend);
  loginForm.appendChild(el)

  setTimeout(() => {
    loginForm.removeChild(el)
  }, 2000);
}

const queueView = (queueItems) => {
  return `<div class="mt-3 col-4">
  <table class="table">
    <thead> 
      <tr>
        <th>Login</th>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="queueItems">
      ${queueItems.map(x => `<tr id="${x.tgid}_row"><td>${x.tglogin}</td><td>${x.name}</td><td><button class="btn btn-success applyuser" id="${x.tgid}">+</button></td></tr>`)}
    </tbody> 
  </table>
  </div>`
}

const viewLoader = () => {
  content.classList.add('fade');
  container.appendChild(loader);
}

const hideLoader = () => {
  content.classList.remove('fade');
  container.removeChild(loader)
}