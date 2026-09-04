// =========================================
// MOBILE NAVIGATION
// =========================================

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {

    menuToggle.addEventListener("click", function () {

        navigation.classList.toggle("show");

    });

}


// =========================================
// CLOSE MOBILE MENU AFTER CLICKING A LINK
// =========================================

const navigationLinks =
    document.querySelectorAll(".navigation a");

navigationLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        navigation.classList.remove("show");

    });

});
