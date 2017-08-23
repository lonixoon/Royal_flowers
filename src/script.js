/**
 * Код клавиши Escape
 * @constant
 * @type {Number}
 */
const ESCAPE_CODE = 27;

/**
 * DOM-элемент тега html
 * @type {Element}
 */
const page = $('.root');

/**
 * DOM-элемент модального окна 'Форма заказа'
 * @type {Element}
 */
const orderModal = $('#order');

/**
 * DOM-элемент модального окна 'Заказать звонок'
 * @type {Element}
 */
const requestCallModal = $('#request-call');

/**
 * Открытие модального окна
 * @param  {Element} modal Модальное окно, которое будет открыто
 */
function showModal(modal) {
  let width = $('body').width();
  $('body').width(width);
  page.addClass('root_lock');
  modal.show();

  if( $(modal).attr('id') === 'order' ) {
    let chosenProductElement = event.currentTarget;
    let productName = $(chosenProductElement).find('.product__name').text();
    let productImg = $(chosenProductElement).siblings('.fotorama').find('.fotorama__active .fotorama__img');
    let productDescr = $(chosenProductElement).find('.product__descr').text();
    let productNumbers = $(chosenProductElement).find('.product__numbers').text();
    let productPacking = $(chosenProductElement).find('.product__packing').text();
    let productPackingColor = $(chosenProductElement).find('.product__packing-color').text();
    let productPrice = $(chosenProductElement).find('.product__price-value').text();

    let productInfo = () => {
      let text;
      if(productDescr) {
        if(productPacking) {
          if(productPackingColor) {
            text = productDescr + ', Упаковка: ' + productPacking + ' (' + productPackingColor + ')';
          } else {
            text = productDescr + ', Упаковка: ' + productPacking;
          }
        } else {
          text = productDescr;
        }
      } else {
        if(productPacking) {
          if(productPackingColor) {
            text = 'Упаковка: ' + productPacking + ' (' + productPackingColor + ')';
          } else {
            text = 'Упаковка: ' + productPacking;
          }
        }
      }
      return text;
    };

    $('.chosen-product__img').attr('src', productImg.attr('src'));
    $('.chosen-product__img').attr('alt', productImg.attr('alt'));
    $('.chosen-product__name').text(productName);
    $('.chosen-product__details').text(productInfo);
    $('.chosen-product__price').text( $(chosenProductElement).find('.product__price').text() );
    $('#order-product').val( productName + '; ' + productNumbers + '; ' + productPrice + 'руб.');
  }
}

/**
 * Закрытие модального окна
 * @param  {Element} modal Модальное окно, которое будет закрыто
 */
function hideModal(modal) {
  modal.hide();
  page.removeClass('root_lock');
  $('body').width('');

  $.each( $(modal).find('input, textarea'), function(index, elem) {
    let element = $(elem);
    element.val('');
    element.removeClass('error');
    element.next('.form__input-error').text('');
  });

  $(modal).find('.form').show();
  $(modal).find('.form-submission-result_success').hide();
  $(modal).find('.form-submission-result_error').hide();
}

/**
 * Отправка формы
 * @param  {Element} modal Модальное окно, форма которого отправляется
 */
function postForm(modal) {
  if( $(modal).attr('id') === 'order' ) {
    let userComment = $(modal).find('#order-comment').val();
    let comments = userComment ? ' Комментарии: ' + userComment : '';
    sendNotifications(modal, 'Заказ букета: ' + $(modal).find('#order-product').val() + ' Телефон: ' + $(modal).find('#order-phone').val() + comments);
  } else {
    sendNotifications(modal, 'Заказ звонка: ' + $(modal).find('#request-call-phone').val());
  }
}

/**
 * Отправка уведомления об отправке формы на почту
 * @param  {Element} modal   Модальное окно, форма которого отправлена
 * @param  {String}  message Текст сообщения
 */
function sendNotifications(modal, message) {
  $
    .post('http://localhost:3000/send', { message: message })
    .done(function() {
      $(modal).find('.form').hide();
      $(modal).find('.form-submission-result_error').hide();
      $(modal).find('.form-submission-result_success').show();
    })
    .fail(function() {
      $(modal).find('.form__controls .form__tips').hide();
      $(modal).find('.form-submission-result_error').show();
    });
}

/**
 * Обработчик события нажатия на кнопку открытия модального окна
 * @param  {Element} modal Модальное окно, которое должно быть открыто
 * @return {}
 */
function onShowClick(modal) {
  return function(event) {
    event.preventDefault();
    showModal(modal);
  };
}

/**
 * Обработчик события нажатия на кнопку закрытия модального окна
 * @param  {Element} modal Модальное окно, которое должно быть закрыто
 * @return {}
 */
function onCloseClick(modal) {
  return function() {
    hideModal(modal);
  };
}

/**
 * Обработчик события нажатия на кнопку отправки формы окна
 * @param  {Element} modal Модальное окно, кнопка в котором нажата
 * @return {}
 */
function onSubmitClick(modal) {
  return function(event) {
    event.preventDefault();
    let formIsValid = true;
    $.each( $(modal).find('input:not([type="hidden"]), textarea'), function(index, elem) {
      let element = $(elem);
      if( element.prop('required') ) {
        if( !element.val() ) {
          element.addClass('error');
          element.next('.form__input-error').text('Обязательное поле');
          formIsValid = false;
        } else {
          element.removeClass('error');
          element.next('.form__input-error').text('');
        }
      }
    });

    if(formIsValid) {
      postForm(modal);
    }
  };
}

/**
 * Обработчик события нажатия на подложку модального окна
 * @param  {Element} modal Модальное окно
 * @return {}
 */
function onOverlayClick(modal) {
  return function(event) {
    if (event.target === event.currentTarget) {
      hideModal(modal);
    }
  };
}

/**
 * Обработчик события нажатия на клавишу Escape
 */
function onEscapeDown() {
  if (event.keyCode === ESCAPE_CODE) {
    $('body').width('');
    hideModal(orderModal);
    hideModal(requestCallModal);
  }
}

// Навешивание обработчиков событий на окно оформления заказа
$('.link_order').click( onShowClick( $('#order') ) );
orderModal.find( $('.btn_submit') ).click( onSubmitClick(orderModal) );
orderModal.find( $('.icon_close') ).click( onCloseClick(orderModal) );
orderModal.click( onOverlayClick(orderModal) );

// Навешивание обработчиков событий на окно заказа звонка
$('.btn_request-call').click( onShowClick(requestCallModal) );
$('.link_request-call').click( onShowClick(requestCallModal) );
requestCallModal.find( $('.btn_submit') ).click( onSubmitClick(requestCallModal) );
requestCallModal.find( $('.icon_close') ).click( onCloseClick(requestCallModal) );
requestCallModal.click( onOverlayClick(requestCallModal) );

// Навешивание обработчиков событий на всю страницу
window.onkeydown = onEscapeDown;
