'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2024-06-13T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
// Reset timer function
const resetTimer = function () {
  clearInterval(timer);
  timer = startTimer();
};

// Timer Function
const startTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(Math.trunc(time % 60)).padStart(2, '0');
    // printing thee time after every second
    labelTimer.textContent = `${min}:${sec}`;

    // Log out when time is 0
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };

  let time = 300;
  // Call the tick immediately first
  tick();
  // Then after every second
  timer = setInterval(tick, 1000);
  return timer;
};

// Number formater function
const formatNum = function (mov, acc) {
  const formatMov = new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(mov);
  return formatMov;
};

// Display movements date function
const formatMovementsDate = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  const DaysPassed = calcDaysPassed(date, new Date());
  if (DaysPassed === 0) return 'Today';
  if (DaysPassed === 1) return 'Yesterday';
  if (DaysPassed <= 7) return `${DaysPassed} days ago`;
  else {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = `${date.getFullYear()}`.padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
};
// Update UI
const updateUI = function () {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

// Display movements html template
const displayMovements = function (acc, sort = false) {
  // Sorting Movements

  const movs = sort
    ? acc.movements.slice().sort((a, b) => b - a)
    : acc.movements; //slice to make a copy of movements

  containerMovements.innerHTML = '';

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Date in each movement row
    const DisplayDate = formatMovementsDate(new Date(acc.movementsDates[i]));

    // Formatted movement using intl
    const formattedMov = formatNum(mov, acc);

    // Changing html
    const html = `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${DisplayDate}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`; //HTML template

    //Inserting changed html
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Computing UserNames
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (val, i) {
        return val.charAt(0);
      })
      .join('');
  });
};
createUsernames(accounts);

// Calculate Display Balance
const calcDisplayBalance = function (acc) {
  acc.balance = Math.abs(
    acc.movements.reduce((acc, mov) => acc + mov, 0).toFixed(2)
  );
  const formattedBalance = formatNum(acc.balance, acc);
  labelBalance.textContent = `${formattedBalance}`;
};

//Calculate Display Summary

const calcDisplaySummary = function (acc) {
  // Money deposited or incoming
  const incomes = Math.abs(
    acc.movements
      .filter(mov => mov > 0)
      .reduce((acc, mov) => acc + mov, 0)
      .toFixed(2)
  );
  const formattedIncome = formatNum(incomes, acc);
  labelSumIn.textContent = `${formattedIncome}`;

  // Money withdrew or outgoing
  const out = Math.abs(
    acc.movements
      .filter(mov => mov < 0)
      .reduce((acc, mov) => acc + mov, 0)
      .toFixed(2)
  );
  const formattedOut = formatNum(out, acc);
  labelSumOut.textContent = `${formattedOut}`;

  // Interest money
  const int = Math.abs(
    acc.movements
      .filter(mov => mov > 0)
      .map(mov => (mov * acc.interestRate) / 100)
      .filter(mov => mov > 1)
      .reduce((acc, mov) => acc + mov, 0)
      .toFixed(2)
  );
  const formattedInterest = formatNum(out, acc);
  labelSumInterest.textContent = `${formattedInterest}`;
};

let currentAccount, timer;

//Login
btnLogin.addEventListener('click', function (e) {
  if (timer) clearInterval(timer);
  timer = startTimer();

  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI();

    // Date
    // Using intl to internationalise date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    // const locale = navigator.language; //The international language
    // console.log(locale);
    console.log(currentAccount.locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = `${now.getFullYear()}`.padStart(2, '0');
    // const hour = `${now.getHours()}`.padStart(2, '0');
    // const minutes = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;
  }
});

// Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    // Update UI
    updateUI();
  }
  resetTimer();
});
// Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= 0.1 * amount)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date());
      updateUI(currentAccount);
    }, 3000); //Setting timeout
  }
  inputLoanAmount.value = '';
  resetTimer();
});
// Deleting account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1); //delete the account
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
});

// Sorting movements
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, true);
  resetTimer();
});
