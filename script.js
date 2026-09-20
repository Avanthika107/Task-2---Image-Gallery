const heartIcon = `<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5c2-.3 3.5.8 4.5 2.3C11.5 5.8 13 4.7 15 5c3.5.5 5 4 3.5 7.5C19 16.65 12 21 12 21z" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`;
const heartFilledIcon = `<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5c2-.3 3.5.8 4.5 2.3C11.5 5.8 13 4.7 15 5c3.5.5 5 4 3.5 7.5C19 16.65 12 21 12 21z" fill="#ff4d5e" stroke="#ff4d5e" stroke-width="1.6"/></svg>`;
const trashIcon = `<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const restoreIcon = `<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 1 3 6.3M4 12v5h5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const checkIcon = `<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-9" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const recentIcon = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

let images = [];
let nextId = 1;
let activeTab = 'pictures';
let albumView = 'albums';
let selecting = false;
let selected = new Set();
let currentDetailId = null;

function loadSamples() {
  const sampleDate = new Date(2026, 7, 18, 14, 30);
  const exts = ['jpg', 'jpeg', 'jpeg', 'jpg', 'png', 'png', 'png', 'png'];
  for (let i = 1; i <= 8; i++) {
    images.push({
      id: nextId++,
      src: `images/i${i}.${exts[i - 1]}`,
      ext: exts[i - 1],
      date: sampleDate,
      favourite: false,
      deleted: false,
      recentAt: null
    });
  }
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yy}, ${h}:${min} ${ampm}`;
}

function activeImages() {
  return images.filter(i => !i.deleted);
}

function showingAlbumsGrid() {
  return activeTab === 'albums' && albumView === 'albums';
}

function currentList() {
  if (activeTab === 'pictures') return activeImages();
  if (albumView === 'favourites') return activeImages().filter(i => i.favourite);
  if (albumView === 'recent') return activeImages().filter(i => i.recentAt).sort((a, b) => b.recentAt - a.recentAt);
  if (albumView === 'recycle') return images.filter(i => i.deleted);
  return [];
}

function setActiveTabUI() {
  document.getElementById('tabPictures').classList.toggle('active', activeTab === 'pictures');
  document.getElementById('tabAlbums').classList.toggle('active', activeTab === 'albums');
}

function renderToolbar() {
  const toolbar = document.getElementById('toolbar');
  const backBtn = document.getElementById('backBtn');
  const title = document.getElementById('toolbarTitle');
  const selectBtn = document.getElementById('selectBtn');

  if (showingAlbumsGrid()) {
    toolbar.classList.add('hidden');
    return;
  }
  toolbar.classList.remove('hidden');

  if (selecting) {
    backBtn.classList.toggle('hidden', activeTab === 'pictures');
    title.textContent = selected.size + ' selected';
    selectBtn.textContent = 'Cancel';
    return;
  }

  selectBtn.textContent = 'Select';

  if (activeTab === 'pictures') {
    backBtn.classList.add('hidden');
    title.textContent = 'Pictures';
  } else {
    backBtn.classList.remove('hidden');
    title.textContent = albumView === 'favourites' ? 'Favourites' : albumView === 'recent' ? 'Recent' : 'Recycle bin';
  }
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const albumsView = document.getElementById('albumsView');
  const addBtn = document.getElementById('addBtn');

  if (showingAlbumsGrid()) {
    grid.classList.add('hidden');
    albumsView.classList.remove('hidden');
    addBtn.classList.remove('hidden');
    renderAlbums();
    return;
  }

  albumsView.classList.add('hidden');
  grid.classList.remove('hidden');
  addBtn.classList.toggle('hidden', selecting);

  const list = currentList();
  grid.innerHTML = '';

  if (list.length === 0) {
    const p = document.createElement('div');
    p.className = 'emptyMsg';
    p.textContent = albumView === 'recycle' && activeTab === 'albums' ? 'Recycle bin is empty' : 'No images here yet';
    grid.appendChild(p);
    return;
  }

  list.forEach(img => {
    const div = document.createElement('div');
    div.className = 'thumb' + (selected.has(img.id) ? ' selected' : '');

    const image = document.createElement('img');
    image.src = img.src;
    div.appendChild(image);

    if (img.favourite && !selecting) {
      const badge = document.createElement('div');
      badge.className = 'heartBadge';
      badge.innerHTML = heartFilledIcon;
      div.appendChild(badge);
    }

    if (selecting) {
      const circle = document.createElement('div');
      circle.className = 'checkCircle';
      if (selected.has(img.id)) circle.innerHTML = checkIcon;
      div.appendChild(circle);
    }

    div.addEventListener('click', () => {
      if (selecting) toggleSelect(img.id);
      else openDetail(img.id);
    });

    grid.appendChild(div);
  });
}

function renderAlbums() {
  const albumsView = document.getElementById('albumsView');
  albumsView.innerHTML = '';

  const defs = [
    { key: 'favourites', name: 'Favourites', list: activeImages().filter(i => i.favourite), icon: heartIcon },
    { key: 'recent', name: 'Recent', list: activeImages().filter(i => i.recentAt).sort((a, b) => b.recentAt - a.recentAt), icon: recentIcon },
    { key: 'recycle', name: 'Recycle bin', list: images.filter(i => i.deleted), icon: trashIcon }
  ];

  defs.forEach(a => {
    const card = document.createElement('div');
    card.className = 'albumCard';

    const thumb = document.createElement('div');
    thumb.className = 'albumThumb';
    if (a.list.length) {
      const img = document.createElement('img');
      img.src = a.list[0].src;
      thumb.appendChild(img);
    } else {
      thumb.innerHTML = a.icon;
    }

    const name = document.createElement('div');
    name.className = 'albumName';
    name.textContent = a.name;

    const count = document.createElement('div');
    count.className = 'albumCount';
    count.textContent = a.list.length;

    card.appendChild(thumb);
    card.appendChild(name);
    card.appendChild(count);

    card.addEventListener('click', () => {
      albumView = a.key;
      selecting = false;
      selected.clear();
      render();
    });

    albumsView.appendChild(card);
  });
}

function renderBottomBar() {
  const bar = document.getElementById('bottomBar');
  bar.classList.toggle('hidden', !selecting);

  const favBtn = document.getElementById('favSelBtn');
  const delBtn = document.getElementById('delSelBtn');

  favBtn.innerHTML = (activeTab === 'albums' && albumView === 'recycle') ? restoreIcon : heartIcon;
  delBtn.innerHTML = trashIcon;
}

function render() {
  renderToolbar();
  renderGrid();
  renderBottomBar();
}

function toggleSelect(id) {
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  render();
}

function updateModalIcons(img) {
  const left = document.getElementById('leftAction');
  const right = document.getElementById('rightAction');
  right.innerHTML = trashIcon;
  left.innerHTML = img.deleted ? restoreIcon : (img.favourite ? heartFilledIcon : heartIcon);
}

function openDetail(id) {
  currentDetailId = id;
  const img = images.find(i => i.id === id);
  if (!img) return;
  if (!img.deleted) img.recentAt = new Date();

  document.getElementById('modalImg').src = img.src;
  document.getElementById('modalExt').textContent = img.ext.toUpperCase();
  document.getElementById('infoPanel').classList.add('hidden');
  updateModalIcons(img);
  document.getElementById('modal').classList.remove('hidden');
}

function closeModalFn() {
  document.getElementById('modal').classList.add('hidden');
  currentDetailId = null;
  render();
}

function addFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const ext = file.type.includes('png') ? 'png' : 'jpg';
      images.push({
        id: nextId++,
        src: e.target.result,
        ext,
        date: new Date(),
        favourite: false,
        deleted: false,
        recentAt: null
      });
      render();
    };
    reader.readAsDataURL(file);
  });
}

loadSamples();
setActiveTabUI();
render();

document.getElementById('tabPictures').addEventListener('click', () => {
  activeTab = 'pictures';
  selecting = false;
  selected.clear();
  setActiveTabUI();
  render();
});

document.getElementById('tabAlbums').addEventListener('click', () => {
  activeTab = 'albums';
  albumView = 'albums';
  selecting = false;
  selected.clear();
  setActiveTabUI();
  render();
});

document.getElementById('menuBtn').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('menuPopup').classList.toggle('hidden');
});

document.getElementById('menuPopup').addEventListener('click', e => e.stopPropagation());

document.addEventListener('click', () => {
  document.getElementById('menuPopup').classList.add('hidden');
});

document.querySelectorAll('.popupItem').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = 'albums';
    albumView = btn.dataset.album;
    selecting = false;
    selected.clear();
    document.getElementById('menuPopup').classList.add('hidden');
    setActiveTabUI();
    render();
  });
});

document.getElementById('backBtn').addEventListener('click', () => {
  albumView = 'albums';
  selecting = false;
  selected.clear();
  render();
});

document.getElementById('selectBtn').addEventListener('click', () => {
  selecting = !selecting;
  selected.clear();
  render();
});

document.getElementById('favSelBtn').addEventListener('click', () => {
  if (activeTab === 'albums' && albumView === 'recycle') {
    images.forEach(i => { if (selected.has(i.id)) i.deleted = false; });
  } else {
    images.forEach(i => { if (selected.has(i.id)) i.favourite = true; });
  }
  selecting = false;
  selected.clear();
  render();
});

document.getElementById('delSelBtn').addEventListener('click', () => {
  if (activeTab === 'albums' && albumView === 'recycle') {
    images = images.filter(i => !selected.has(i.id));
  } else {
    images.forEach(i => {
      if (selected.has(i.id)) {
        i.deleted = true;
        i.favourite = false;
      }
    });
  }
  selecting = false;
  selected.clear();
  render();
});

document.getElementById('addBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', e => {
  addFiles(e.target.files);
  e.target.value = '';
});

document.getElementById('closeModal').addEventListener('click', closeModalFn);

document.getElementById('leftAction').addEventListener('click', () => {
  const img = images.find(i => i.id === currentDetailId);
  if (!img) return;
  if (img.deleted) {
    img.deleted = false;
    closeModalFn();
  } else {
    img.favourite = !img.favourite;
    updateModalIcons(img);
    render();
  }
});

document.getElementById('rightAction').addEventListener('click', () => {
  const img = images.find(i => i.id === currentDetailId);
  if (!img) return;
  if (img.deleted) {
    images = images.filter(i => i.id !== currentDetailId);
    closeModalFn();
  } else {
    img.deleted = true;
    img.favourite = false;
    closeModalFn();
  }
});

document.getElementById('infoBtn').addEventListener('click', () => {
  const img = images.find(i => i.id === currentDetailId);
  if (!img) return;
  const panel = document.getElementById('infoPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    document.getElementById('infoDate').textContent = 'Added ' + formatDate(img.date);
    const albs = [];
    if (img.favourite) albs.push('Favourites');
    if (img.recentAt) albs.push('Recent');
    if (img.deleted) albs.push('Recycle bin');
    document.getElementById('infoAlbums').textContent = 'Albums: ' + (albs.length ? albs.join(', ') : 'None');
  }
});

['dragenter', 'dragover'].forEach(evt => {
  document.addEventListener(evt, e => {
    e.preventDefault();
    document.getElementById('dropOverlay').classList.remove('hidden');
  });
});

document.addEventListener('dragleave', e => {
  e.preventDefault();
  document.getElementById('dropOverlay').classList.add('hidden');
});

document.addEventListener('drop', e => {
  e.preventDefault();
  document.getElementById('dropOverlay').classList.add('hidden');
  addFiles(e.dataTransfer.files);
});

document.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  const files = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) files.push(items[i].getAsFile());
  }
  if (files.length) addFiles(files);
});