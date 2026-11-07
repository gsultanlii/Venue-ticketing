
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