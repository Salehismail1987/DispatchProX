// SIDEBAR TOGGLE

let sidebarOpen = false;
const sidebar = document.getElementById("sidebar");

function openSidebar() {
    if (!sidebarOpen) {
        sidebar.classList.add("sidebar-responsive");
        sidebarOpen = true;
    }
}

function closeSidebar() {
    if (sidebarOpen) {
        sidebar.classList.remove("sidebar-responsive");
        sidebarOpen = false;
    }
}
$(document).ready(function() {
    $(document).on("click", ".openpop", function() {
        $(this).closest('.mainpopupdiv').find('.inapp-popup').toggle();
    });
    $(document).on("click", ".my-nav-tabs .nav-link", function() {
        if ($(this).attr('id') == 'project_profile-tab') {
            $('.profile_heading_div').show();
            $('.tracker_heading_div').hide();
        } else {
            $('.profile_heading_div').hide();
            $('.tracker_heading_div').show();
        }
    });
    // window.addEventListener('click', function(e) {
    //     if (!$(e.target).closest('.inapp-popup').length) {
    //         if (!($(this).hasClass('openpop') || $(this).closest('.openpop').length)) {
    //             $('.inapp-popup').hide();
    //         }
    //     }
    // });
});