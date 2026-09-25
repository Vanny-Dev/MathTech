import Swal from 'sweetalert2';

/**
 * SweetAlert2 dressed in the app's comic style.
 *
 * The library's default look — rounded corners, soft shadow, system font — sits
 * badly next to thick ink borders and Fredoka One everywhere else, so every
 * dialog goes through here rather than calling Swal directly.
 */
const comic = Swal.mixin({
  buttonsStyling: false,          // let the app's own .btn classes win
  customClass: {
    popup:       'swal-comic',
    title:       'swal-comic-title',
    htmlContainer: 'swal-comic-text',
    confirmButton: 'btn btn-primary swal-comic-btn',
    cancelButton:  'btn btn-outline swal-comic-btn',
  },
});

export const alertSuccess = (title, text) =>
  comic.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'OK',
  });

export const alertError = (title, text) =>
  comic.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
  });

export default comic;
