'use strict';
import imageListItemsTemplateNotEach from '../templates/infinityImage.hbs';
import InfiniteScroll from 'infinite-scroll';
import 'material-design-icons/iconfont/material-icons.css';
import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/src/styles/main.scss';

import PNotify from 'pnotify/dist/es/PNotify.js';
import 'pnotify/dist/PNotifyBrightTheme.css';
PNotify.defaults.delay = 3000;

const refs = {
    searchForm: document.querySelector('#search-form'),
    galleryItems: document.querySelector('#gallery'),
    body: document.querySelector('body'),
}

let inputValue = '';

refs.searchForm.addEventListener('submit', searchFormSubmit);

function searchFormSubmit(e) {
    e.preventDefault();
    clearImageItems();
    infScrollInstance.pageIndex = 1;

    const form = e.currentTarget;
    const input = form.elements.query;
    inputValue = input.value;
    if (inputValue === '') {
        PNotify.error({
            text: 'Нужно ввести запрос!',
        });
    } else {
        infScrollInstance.loadNextPage();
    }
}

const infScrollInstance = new InfiniteScroll(refs.galleryItems, {
    responseType: 'text',
    history: false,
    path() {
        return `https://cors-anywhere.herokuapp.com/https://pixabay.com/api/?image_type=photo&orientation=horizontal&q=${inputValue}&page=${this.pageIndex}&per_page=12&key=15216450-d096caa7dd5d740f777344039`
    }
});

infScrollInstance.on('load', response => {
    const posts = JSON.parse(response);
    const hitsPosts = posts.hits;
    const marcup = hitsPosts.map(post => imageListItemsTemplateNotEach(post)).join('');
    const proxyEl = document.createElement('div');
    proxyEl.innerHTML = marcup;

    const childItems = proxyEl.querySelectorAll('.photo-card');
    infScrollInstance.appendItems(childItems);
    if (childItems.length >= 12) {
        PNotify.success({
            text: "Подгрузились изображения!"
        });
    }
    else if (childItems.length === 0) {
        PNotify.error({
            text: 'Изображений нет!',
        });
    } else if (childItems.length <= 12) {
        PNotify.error({
            text: 'Изображения заканчиваются их очень мало!',
        });
    }
})

function clearImageItems() {
    refs.galleryItems.innerHTML = '';
}

//===========================================работа basicLightbox плагина===
refs.body.addEventListener('click', showBigImage);

function showBigImage(e) {
    if (e.target.nodeName === 'IMG') {
        const imageBig = e.target.getAttribute('data-source');
        basicLightbox.create(`
        <img src="${imageBig}">
    `).show()
    }
}