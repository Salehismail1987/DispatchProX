(function($) {
    var isDesktop = true;
    $.fn.calendarDeclined = function(opts) {
        var options = $.extend({
            color: '#308B22',
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
            onSelect: function(event) {}
        }, $.fn.calendar.defaults, opts);
        return this.each(function() {
            var currentYear, currentMonth, currentDay, currentCalendar;

            initCalendarDeclined($(this), options);
        });
    };

    function checkdatesDeclined() {
        setTimeout(()=>{
            var abc=$("#jobsData").text();

            if(abc!=''){
                datejobs= (JSON.parse(abc))
              
                console.log(datejobs);
                for (let i = 0; i < datejobs.length; i++) {
                    bgcolor = '';
                    datatarget = '';
                    divitem = '.date-item-' + datejobs[i].date;
                    var jobscount = 0;
                    
                    for (let j = 0; j < datejobs[i].jobs.length; j++) {
                        if (datejobs[i].jobs[j].status == 'pending') {
                            bgcolor = 'date-grey';
                            if (datejobs[i].jobs.length < 1) {
                                $(divitem).find('div').attr("data-toggle", "modal");
                                $(divitem).find('div').attr("data-target", "#myModalPending");
                            }
                            datatarget = ' data-toggle="modal" data-target="#myModalPending"';
                        } else if (datejobs[i].jobs[j].status == 'accepted') {
                            bgcolor = 'date-yellow';
                            if (datejobs[i].jobs.length < 1) {
                                $(divitem).find('div').attr("data-toggle", "modal");
                                $(divitem).find('div').attr("data-target", "#myModalAccepted");
                            }
                            datatarget = ' data-toggle="modal" data-target="#myModalAccepted"';
                        } else if (datejobs[i].jobs[j].status == 'inprogress') {
                            bgcolor = 'date-yellow2';
                            if (datejobs[i].jobs.length < 1) {
                                $(divitem).find('div').attr("data-toggle", "modal");
                                $(divitem).find('div').attr("data-target", "#myModalInprogress");
                            }
                            datatarget = ' data-toggle="modal" data-target="#myModalInprogress"';
                        } else if (datejobs[i].jobs[j].status == 'completed') {
                            bgcolor = 'date-green';
                            $(divitem).find('div').attr("data-toggle", "modal");
                            if (datejobs[i].jobs.length < 1) {
                                $(divitem).find('div').attr("data-target", "#myModalCompleted");
                                datatarget = ' data-toggle="modal" data-target="#myModalCompleted"';
                            }
                        } else if (datejobs[i].jobs[j].status == 'approved') {
                            bgcolor = 'date-blue';
                            if (datejobs[i].jobs.length < 1) {
                                $(divitem).find('div').attr("data-toggle", "modal");
                                $(divitem).find('div').attr("data-target", "#myModalAapproved");
                            }
                            datatarget = ' data-toggle="modal" data-target="#myModalAapproved"';
                        } else if (datejobs[i].jobs[j].status == 'declined') {

                            bgcolor = 'border-red';
                            datatarget = ' data-toggle="modal" data-target="#myModalDeclined"';
                        } else if (datejobs[i].jobs[j].status == 'Cancelled') {
                            bgcolor = 'border-red';
                            datatarget = ' data-toggle="modal" data-target="#myModalDeclined"';
                        }
                        $(divitem).find('div').addClass(bgcolor);
                        var isOneStatus = false;
                        if (isDesktop) {
                            //bgcolor = '';
                            //if (isOneStatus) {
                            if (datejobs[i].jobs[j].status == 'pending') {
                                bgcolor = 'date-grey';
                                datatarget = ' data-toggle="modal" data-target="#myModalPending"';
                            } else if (datejobs[i].jobs[j].status == 'accepted') {
                                bgcolor = 'date-yellow';
                                datatarget = ' data-toggle="modal" data-target="#myModalAccepted"';
                            } else if (datejobs[i].jobs[j].status == 'inprogress') {
                                bgcolor = 'date-yellow2';
                                datatarget = ' data-toggle="modal" data-target="#myModalInprogress"';
                            } else if (datejobs[i].jobs[j].status == 'completed') {
                                bgcolor = 'date-green';
                                datatarget = ' data-toggle="modal" data-target="#myModalCompleted"';
                            } else if (datejobs[i].jobs[j].status == 'approved') {
                                bgcolor = 'date-blue';
                                datatarget = ' data-toggle="modal" data-target="#myModalAapproved"';
                            } else if (datejobs[i].jobs[j].status == 'declined') {
                                bgcolor = 'date-red';
                                datatarget = ' data-toggle="modal" data-target="#myModalDeclined"';
                            } else if (datejobs[i].jobs[j].status == 'Cancelled') {
                                bgcolor = 'date-red';
                                datatarget = ' data-toggle="modal" data-target="#myModalDeclined"';
                            }
                            //}
                            var status_content = "<br><span class='job-status " + bgcolor + "' " + datatarget + "> ";
                            if (datejobs[i].jobs.length > 1) {
                                status_content += datejobs[i].jobs[j].count.toString() + " ";
                            }

                    
                            status_content += parseInt(datejobs[i].jobs[j].count.toString()) + " " + datejobs[i].jobs[j].status + "</span>";
                           
                            $(divitem).find('div').append(status_content);
                        }
                        isOneStatus = true;
                        jobscount = parseInt(jobscount) + parseInt(datejobs[i].jobs[j].count.toString());
                        console.log(jobscount);
                    }
                    if (!isDesktop && jobscount > 1) {
                        $(divitem).find('div').append("<span class='count-jobs'>" + jobscount + "</span>");
                    }
                }
            }
          
        },2000);
      
    }

    function initCalendarDeclined(wrapper, options) {
        var color = options.color;
        var forCust = options.forCust;
        wrapper.addClass('calendar').empty();
        if (isDesktop) {
            wrapper.addClass('desktop-calendar').empty();
            if(forCust){
                wrapper.addClass('calendar-customer').empty();
            }else{
                wrapper.addClass('calendar-declined').empty();
            }
        }

        var header = $('<header>').appendTo(wrapper);
        header.addClass('calendar-header');
        header.css({
            color: createContrastDeclined(color)
        });

        var buttonLeft = $('<span>').appendTo(header);
        buttonLeft.addClass('button').addClass('left');
        buttonLeft.html(' <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M7 9L1 5L7 0.999999" stroke="black" stroke-linejoin="round"/> </svg> ');
        buttonLeft.bind('click', function() {
            currentCalendar = $(this).parents('.calendar');
            selectMonthDeclined(false, options);
        });
        //buttonLeft.bind('mouseover', function() { $(this).css('background', createAccentDeclined(color, -20)); });
        //buttonLeft.bind('mouseout', function() { $(this).css('background', color); });

        var headerLabel = $('<span>').appendTo(header);
        headerLabel.addClass('header-label')
        headerLabel.addClass('header-month-title');
        headerLabel.html(' Month Year ');
        headerLabel.bind('click', function() {
            currentCalendar = $(this).parents('.calendar');
            selectMonthDeclined(null, options, new Date().getMonth(), new Date().getFullYear());

            currentDay = new Date().getDate();
            triggerSelectEventDeclined(options.onSelect);
        });

        var buttonRight = $('<span>').appendTo(header);
        buttonRight.addClass('button').addClass('right');
        buttonRight.html('<svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 5L1 9" stroke="black" stroke-linejoin="round"/></svg>');
        buttonRight.bind('click', function() {
            currentCalendar = $(this).parents('.calendar');
            selectMonthDeclined(true, options);
        });
        //buttonRight.bind('mouseover', function() { $(this).css('background', createAccentDeclined(color, -20)); });
        //buttonRight.bind('mouseout', function() { $(this).css('background', color); });

        var dayNames = $('<table>').appendTo(wrapper);
        dayNames.append('<thead><th>' + options.days.join('</th><th>') + '</th></thead>');
        dayNames.css({
            width: '100%'
        });

        var calendarFrame = $('<div>').appendTo(wrapper);
        calendarFrame.addClass('calendar-frame');

        headerLabel.click();
    }

    function selectMonthDeclined(next, options, month, year) {
        var tmp = currentCalendar.find('.header-label').text().trim().split(' '),
            tmpYear = parseInt(tmp[1], 10);

        if (month === 0) {
            currentMonth = month;
        } else {
            currentMonth = month || ((next) ? ((tmp[0] === options.months[options.months.length - 1]) ? 0 : options.months.indexOf(tmp[0]) + 1) : ((tmp[0] === options.months[0]) ? 11 : options.months.indexOf(tmp[0]) - 1));
        }

        currentYear = year || ((next && currentMonth === 0) ? tmpYear + 1 : (!next && currentMonth === 11) ? tmpYear - 1 : tmpYear);

        var calendar = createCalendarDeclined(currentMonth, currentYear, options),
            frame = calendar.frame();

        currentCalendar.find('.calendar-frame').empty().append(frame);
        currentCalendar.find('.header-label').text(calendar.label);

        frame.on('click', 'td', function() {
            $('td').find('div').removeClass('selected');
            $(this).find('div').addClass('selected');

            currentDay = $(this).text();
            triggerSelectEventDeclined(options.onSelect);
        });
        if (options.showdetail == true) {
            checkdatesDeclined();
        }
    }

    function createCalendarDeclined(month, year, options) {
        var currentDay = 1,
            daysLeft = true,
            startDay = new Date(year, month, currentDay).getDay() - 1,
            lastDays = [31, (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            calendar = [];

        var i = 0;
        while (daysLeft) {
            calendar[i] = [];

            for (var d = 0; d < 7; d++) {
                if (i == 0) {
                    if (d == startDay) {
                        calendar[i][d] = currentDay++;
                        startDay++;
                    } else if (startDay === -1) {
                        calendar[i][6] = currentDay++;
                        startDay++;
                    }
                } else if (currentDay <= lastDays[month]) {
                    calendar[i][d] = currentDay++;
                } else {
                    calendar[i][d] = '';
                    daysLeft = false;
                }

                if (currentDay > lastDays[month]) {
                    daysLeft = false;
                }
            }

            i++;
        }

        var frame = $('<table>').addClass('current');
        var frameBody = $('<tbody>').appendTo(frame);

        for (var j = 0; j < calendar.length; j++) {
            var frameRow = $('<tr>').appendTo(frameBody);

            $.each(calendar[j], function(index, item) {
                var frameItem = $('<td  class="date-item-' + item + '-' + (month + 1) + '-' + year + '">').appendTo(frameRow);
                if (item) {
                    divsclass = "";
                    if (options.smalldivs == true) {
                        divsclass = "small-divs";
                    }
                    frameItem.html("<div class=" + divsclass + ">" + item + "</div>");
                } else {
                    frameItem.html(item);
                }
            });
        }
        $('td:empty', frame).addClass('disabled');
        if (currentMonth === new Date().getMonth()) {
            $('td', frame).filter(function() { return $(this).text() === new Date().getDate().toString(); }).addClass('today');
        }

        return { frame: function() { return frame.clone() }, label: options.months[month] + ' ' + year };
    }

    function triggerSelectEventDeclined(event) {
        var date = new Date(currentYear, currentMonth, currentDay);

        var label = [];
        label[0] = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
        label[1] = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        label[2] = (date.getFullYear());

        if (event != undefined) {
            event({ date: date, label: label.join('.') });
        }
    }

    function createContrastDeclined(color) {
        if (color.length < 5) {
            color += color.slice(1);
        }
        return (color.replace('#', '0x')) > (0xffffff) ? '#222' : '#fff';
    }

    function createAccentDeclined(color, percent) {
        var num = parseInt(color.slice(1), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}(jQuery));