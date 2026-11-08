
const $ = id => document.getElementById(id);

const seats = new Map();


function buildVenue() {
  const world = $('world');
  world.style.width = VENUE.width + 'px';
  world.style.height = VENUE.height + 'px';

  const pitch = VENUE.seatSize + VENUE.gap;

  const st = VENUE.stage;
  const stage = document.createElement('div');
  stage.className = 'stage';
  stage.textContent = st.label;
  stage.style.left = st.x + 'px';
  stage.style.top = st.y + 'px';
  stage.style.width = st.w + 'px';
  stage.style.height = st.h + 'px';
  world.appendChild(stage);

  VENUE.sections.forEach((sec, secIndex) => {
    const cat = VENUE.categories[sec.cat];


    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = sec.name + ' · ' + cat.price + ' ₼';
    label.style.left = sec.x + 'px';
    label.style.top = (sec.y - 22) + 'px';
    world.appendChild(label);

  
    for (let r = 0; r < sec.rows; r++) {
      const rowLetter = String.fromCharCode(65 + r);   

    
      for (let c = 0; c < sec.cols; c++) {
        const id = sec.id + '-' + rowLetter + (c + 1);   

     
        const unavailable = (r * 7 + c * 3 + secIndex * 5) % 11 === 0;


        const seat = {
          id: id,
          section: sec.name,
          row: rowLetter,
          number: c + 1,
          cat: sec.cat,
          price: cat.price,
          unavailable: unavailable
        };

   
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'seat' + (unavailable ? ' unavailable' : '');
        btn.dataset.id = id;
        btn.textContent = c + 1;
        btn.style.setProperty('--c', cat.color);          
        btn.style.left = (sec.x + c * pitch) + 'px';
        btn.style.top = (sec.y + r * pitch) + 'px';
        btn.style.width = VENUE.seatSize + 'px';
        btn.style.height = VENUE.seatSize + 'px';
        btn.setAttribute(
          'aria-label',
          sec.name + ', row ' + rowLetter + ', seat ' + (c + 1) + ', ' + cat.price + ' AZN' +
          (unavailable ? ', unavailable' : '')
        );

        seat.el = btn;          
        seats.set(id, seat);   
        world.appendChild(btn); 
      }
    }
  });
}



function buildLegend() {
  const items = [];


  Object.values(VENUE.categories).forEach(c => {
    items.push(
      '<li><i style="background:' + c.color + '"></i>' + c.name + ' – ' + c.price + ' ₼</li>'
    );
  });

  
  items.push('<li><i style="background:#fff;border:2px solid #e8734a"></i>Selected</li>');
  items.push('<li><i style="background:#e8734a"></i>In cart</li>');
  items.push('<li><i style="background:#9d9da3"></i>Unavailable</li>');

  $('legend').innerHTML = items.join('');
}


buildLegend();
buildVenue();


let cart = [];
let inspectedId=null;

function refreshSeat(id) {
  const s = seats.get(id);
  const inCart = cart.includes(id);
  s.el.classList.toggle('unavailable', s.unavailable);
  s.el.classList.toggle('in-cart', inCart);
  s.el.classList.toggle('inspected', inspectedId === id && !inCart);
}


function inspect(id) {
  const previous = inspectedId;
  inspectedId = id;

  if (previous) refreshSeat(previous);  
  refreshSeat(id);                       
  renderDetails();
}


function renderDetails(message) {
  const box = $('details');

  if (!inspectedId) {
    box.innerHTML = '<p class="muted">Pick a seat on the map to preview its ticket.</p>';
    return;
  }

  const s = seats.get(inspectedId);
  const inCart = cart.includes(s.id);

  let status = 'Available';
  if (s.unavailable) status = 'Unavailable';
  else if (inCart) status = 'In your cart';

  let buttonText = 'ADD TO CART';
  if (s.unavailable) buttonText = 'Seat unavailable';
  else if (inCart) buttonText = 'Already in cart';

  box.innerHTML =
    '<div class="detail-row"><span>Section</span><span>' + s.section + '</span></div>' +
    '<div class="detail-row"><span>Row / Seat</span><span>' + s.row + ' / ' + s.number + '</span></div>' +
    '<div class="detail-row"><span>Category</span><span>' + VENUE.categories[s.cat].name + '</span></div>' +
    '<div class="detail-row"><span>Price</span><span>' + s.price + ' ₼</span></div>' +
    '<div class="detail-row"><span>Status</span><span>' + status + '</span></div>' +
    '<button class="btn" id="addBtn"' + (s.unavailable || inCart ? ' disabled' : '') + '>' +
      buttonText + '</button>' +
    (message ? '<p class="msg">' + message + '</p>' : '');
}


$('world').addEventListener('click', function (e) {
  const btn = e.target.closest('.seat');
  if (btn) inspect(btn.dataset.id);
});



const viewport = $('viewport');
const view = { scale: 1, x: 0, y: 0 };  
const MIN_SCALE = 0.3;                   
const MAX_SCALE = 3;                     
const MOVE_STEP = 80;                    

function applyView() {
  $('world').style.transform =
    'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')';
}

function clampView() {
  const margin = 80;
  const w = VENUE.width * view.scale;
  const h = VENUE.height * view.scale;
  view.x = Math.min(viewport.clientWidth - margin, Math.max(margin - w, view.x));
  view.y = Math.min(viewport.clientHeight - margin, Math.max(margin - h, view.y));
}

function zoomBy(factor) {
  const cx = viewport.clientWidth / 2;
  const cy = viewport.clientHeight / 2;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
  const k = newScale / view.scale;

  view.x = cx - (cx - view.x) * k;
  view.y = cy - (cy - view.y) * k;
  view.scale = newScale;

  clampView();
  applyView();
}

function moveBy(dx, dy) {
  view.x += dx;
  view.y += dy;
  clampView();
  applyView();
}

function resetView() {
  view.scale = Math.min(
    viewport.clientWidth / VENUE.width,
    viewport.clientHeight / VENUE.height,
    1
  );
  view.x = (viewport.clientWidth - VENUE.width * view.scale) / 2;
  view.y = (viewport.clientHeight - VENUE.height * view.scale) / 2;
  applyView();
}

$('zoomIn').addEventListener('click', function () { zoomBy(1.25); });
$('zoomOut').addEventListener('click', function () { zoomBy(0.8); });
$('up').addEventListener('click', function () { moveBy(0, MOVE_STEP); });
$('down').addEventListener('click', function () { moveBy(0, -MOVE_STEP); });
$('left').addEventListener('click', function () { moveBy(MOVE_STEP, 0); });
$('right').addEventListener('click', function () { moveBy(-MOVE_STEP, 0); });
$('reset').addEventListener('click', resetView);

window.addEventListener('resize', function () {
  clampView();
  applyView();
});


resetView();


function cartChanged() {
  saveCart();
  renderCart();
}

function addToCart() {
  if (!inspectedId) return;
  const s = seats.get(inspectedId);

  if (s.unavailable) {
    renderDetails('This seat is not available.');
    return;
  }

  if (cart.includes(s.id)) {
    renderDetails('This seat is already in your cart.');
    return;
  }

  cart.push(s.id);
  refreshSeat(s.id);     
  cartChanged();
  renderDetails();       
}

function removeFromCart(id) {
  cart = cart.filter(function (x) { return x !== id; });
  refreshSeat(id);     
  cartChanged();
  if (inspectedId) renderDetails();
}

function clearCart() {
  const old = cart.slice();
  cart = [];
  old.forEach(refreshSeat);
  cartChanged();
  if (inspectedId) renderDetails();
}

function renderCart() {
  const list = $('cart');
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<li class="muted">Your cart is empty.</li>';
  }

  let total = 0;

  cart.forEach(function (id) {
    const s = seats.get(id);
    total += s.price;

    const li = document.createElement('li');
    li.innerHTML =
      '<div>' + s.section +
      '<small>Row ' + s.row + ', seat ' + s.number + ' · ' +
      VENUE.categories[s.cat].name + '</small></div>' +
      '<strong>' + s.price + ' ₼</strong>';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Remove';
    btn.setAttribute('aria-label',
      'Remove ' + s.section + ' row ' + s.row + ' seat ' + s.number);
    btn.addEventListener('click', function () { removeFromCart(id); });

    li.appendChild(btn);
    list.appendChild(li);
  });

  $('total').textContent = total + ' ₼';
}

$('details').addEventListener('click', function (e) {
  if (e.target.id === 'addBtn') addToCart();
});

$('clear').addEventListener('click', clearCart);

renderCart();



const STORAGE_KEY = 'venueCart_v1';

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn('Cart could not be saved:', err);
  }
}

function loadCart() {
  let saved = [];

  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (err) {
    saved = [];   
  }

  cart = saved.filter(function (id, index) {
    return seats.has(id) &&
           !seats.get(id).unavailable &&
           saved.indexOf(id) === index;
  });

  cart.forEach(refreshSeat); 
  renderCart();                
}

loadCart();



// =========================================
// 9. BONUS:
// =========================================

function zoomAtPoint(factor, px, py) {
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
  const k = newScale / view.scale;

  view.x = px - (px - view.x) * k;
  view.y = py - (py - view.y) * k;
  view.scale = newScale;

  clampView();
  applyView();
}

viewport.addEventListener('wheel', function (e) {
  e.preventDefault(); 

  const rect = viewport.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  zoomAtPoint(e.deltaY < 0 ? 1.1 : 1 / 1.1, px, py);
}, { passive: false });

let drag = null;            
let justDragged = false;    

viewport.addEventListener('pointerdown', function (e) {
  if (e.button !== 0) return; 
  drag = { x: e.clientX, y: e.clientY, moved: false };
});

window.addEventListener('pointermove', function (e) {
  if (!drag) return;

  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;

  if (!drag.moved && Math.hypot(dx, dy) < 5) return;

  drag.moved = true;
  viewport.classList.add('dragging');
  drag.x = e.clientX;
  drag.y = e.clientY;
  moveBy(dx, dy);
});

window.addEventListener('pointerup', function () {
  if (drag && drag.moved) {
    justDragged = true;
    setTimeout(function () { justDragged = false; }, 0);
  }
  drag = null;
  viewport.classList.remove('dragging');
});

viewport.addEventListener('click', function (e) {
  if (justDragged) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);