function checkNull() {
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let alertE = document.getElementById('alertE');
    let alertPw = document.getElementById('alertPw');

    if (email && email.value.trim() === "") {
        email.focus();
        email.style.borderColor = "red";
        //email.style.marginBottom = '0';
        alertE.innerText = 'Email is required';
        //return false; // dừng lại, báo lỗi
    } else {
        alertE.innerText = ''
        email.style.borderColor = "black";
    }

    if (password && password.value.trim() === "") {
        password.focus();
        password.style.borderColor = "red";
        //password.style.marginBottom = '0';
        alertPw.innerText = 'Password is required';
        return false;
    } else {
        alertPw.innerText = ''
        password.style.borderColor = "black";
    }

    return true; // hợp lệ
}



