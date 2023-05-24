let cntPers = 40; // total count parsons
let currentPersonsCntView = 3; // current view parsons on page, default 3
let paginationActive = 1;

function drawPagination() {
    let pages = Math.ceil(cntPers / currentPersonsCntView);
    $('.pagination').remove();
    for (let i = 0; i < pages; i++) {
        $("#navbar").append($('<div>').addClass('pagination').text(i + 1));
    }
    $(".pagination").eq(paginationActive - 1).addClass('active');
    $('.pagination').on("click", function () {
        paginationActive = $(this).text();
        getPers($('#countPersons').val());
    });
}

// Base draw function on startup
$(window).on('load', function () {
    updatePersonsCnt();
    $('#countPersons').change(function () {
        currentPersonsCntView = $(this).val();
        paginationActive = 1;
        getPers(currentPersonsCntView);
    });
    $('#createPlayer').on('click', function () {
        createPlayer();
    });

    getPers(currentPersonsCntView);
    drawPagination();

});

function updatePersonsCnt() {
    $.getJSON("/rest/players/count", {
        format: "json"
    }).done(function (cnt) {
        cntPers = cnt;
    });
}

function getPers(cnt) {
    $("#characterRecords tbody").empty();
    updatePersonsCnt();
    $.getJSON("/rest/players", {pageNumber: (paginationActive - 1), pageSize: cnt})
        .done(function (data) {
            $.each(data, function (i, item) {
                $("#characterRecords").append(
                    $('<tr>').attr('id', 'id' + item.id).append(
                        $('<td>').text(item.id),
                        $('<td>').addClass('tableNameVal').text(item.name),
                        $('<td>').addClass('tableTitleVal').text(item.title),
                        $('<td>').addClass('tableRaceVal').text(item.race),
                        $('<td>').addClass('tableProfessionVal').text(item.profession),
                        $('<td>').text(item.level),
                        $('<td>').text(getDate(item.birthday)),
                        $('<td>').addClass('tableBannedVal').text(item.banned),
                        $('<td>').addClass("edit").on("click",
                            function () {
                                editPerson(item.id, $(this))
                            }).append("<img src=\"/img/edit.png\">"),
                        $('<td>').addClass("delete").on("click",
                            function () {
                                deletePerson(item.id)
                            }).append("<img src=\"/img/delete.png\">")
                    )
                );
            });
        });
    drawPagination();
};

function deletePerson(id) {
    $.ajax({
        url: '/rest/players/' + id,
        type: 'DELETE',
        success: function (result) {
        }
    });
    updatePersonsCnt();
    getPers(currentPersonsCntView);
}

function editPerson(id, t) {
    $(t).next("td").empty().off();
    $(t).html("<img src=\"/img/save.png\">");
    let row = $('#id' + id);
    let name = row.find('.tableNameVal').text();
    let nameElem = row.find('.tableNameVal');
    let title = row.find('.tableTitleVal').text();
    let titleElem = row.find('.tableTitleVal');
    let race = row.find('.tableRaceVal').text();
    let raceElem = row.find('.tableRaceVal');
    let profession = row.find('.tableProfessionVal').text();
    let professionElem = row.find('.tableProfessionVal');
    let banned = row.find('.tableBannedVal').text();
    let bannedElem = row.find('.tableBannedVal');
    nameElem.empty().append($("<input>")
        .attr('type', 'text')
        .attr('minlength', 1)
        .attr('maxlength', 12)
        .prop("value", name).on('submit', function (e) {
            e.preventDefault();
        }));
    titleElem.empty().append($("<input>")
        .attr('type', 'text')
        .attr('minlength', 1)
        .attr('maxlength', 30)
        .val(title).on('submit', function (e) {
            e.preventDefault();
        }));
    raceElem.empty().append($("<select>").html(
        "<option value=\"HUMAN\">HUMAN</option>\n" +
        "<option value=\"DWARF\">DWARF</option>\n" +
        "<option value=\"ELF\">ELF</option>\n" +
        "<option value=\"GIANT\">GIANT</option>\n" +
        "<option value=\"ORC\">ORC</option>\n" +
        "<option value=\"TROLL\">TROLL</option>\n" +
        "<option value=\"HOBBIT\">HOBBIT</option>"));
    raceElem.find("select").prop("selectedIndex", getRaceIndex(race));
    professionElem.empty().append($("<select>").html(
        "<option value=\"WARRIOR\">WARRIOR</option>\n" +
        "<option value=\"ROGUE\">ROGUE</option>\n" +
        "<option value=\"SORCERER\">SORCERER</option>\n" +
        "<option value=\"CLERIC\">CLERIC</option>\n" +
        "<option value=\"PALADIN\">PALADIN</option>\n" +
        "<option value=\"NAZGUL\">NAZGUL</option>\n" +
        "<option value=\"WARLOCK\">WARLOCK</option>\n" +
        "<option value=\"DRUID\">DRUID</option>"));
    professionElem.find("select").prop("selectedIndex", getProfessionIndex(profession));
    bannedElem.empty().append($("<select>").html(
        "<option value=\"false\">false</option>\n" +
        "<option value=\"true\">true</option>\n"));
    bannedElem.find("select").prop("selectedIndex", banned === 'true');

    row.find('img').on('click', function (e) {
        e.preventDefault();
        let nameVal = nameElem.find("input").val();
        let titleVal = titleElem.find("input").val();
        let profVal = professionElem.find("select").val();
        let raceVal = raceElem.find("select").val();
        let banVal = bannedElem.find("select").val();

        $.ajax({
            type: 'POST',
            url: 'rest/players/' + id,
            data: JSON.stringify({
                name: nameVal,
                title: titleVal,
                race: raceVal,
                profession: profVal,
                banned: banVal
            }),
            success: function (data) {
                getPers(currentPersonsCntView);
            },
            contentType: "application/json",
            dataType: 'json'
        });
        return false;
    });

    function getProfessionIndex(profession) {
        switch (profession) {
            case 'WARRIOR':
                return 0;
            case 'ROGUE':
                return 1;
            case 'SORCERER':
                return 2;
            case 'CLERIC':
                return 3;
            case 'NAZGUL':
                return 4;
            case 'WARLOCK':
                return 5;
            case 'DRUID':
                return 6;
            default:
                return 0;
        }
    }

    function getRaceIndex(race) {
        switch (race) {
            case 'HUMAN':
                return 0;
            case 'DWARF':
                return 1;
            case 'ELF':
                return 2;
            case 'GIANT':
                return 3;
            case 'ORC':
                return 4;
            case 'TROLL':
                return 5;
            case 'HOBBIT':
                return 6;
            default:
                return 0;
        }
    }
}
function getDate(mils) {
    let date = new Date(mils);
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}

function createPlayer() {
    let contactForm = $('#contact-form');
    let nameVal = contactForm.find("#name").val();
    let titleVal = contactForm.find("#title").val();
    let raceVal = contactForm.find("#race").val();
    let profVal =  contactForm.find("#profession").val();
    let banVal =  contactForm.find("#banned").val();
    let birthdayVal =  contactForm.find("#birthday").val();
    let levelVal =  contactForm.find("#level").val();
    if (nameVal == "" || titleVal == "" || raceVal == "" || profVal == ""
        || banVal == "" || birthdayVal == "" || levelVal == "") {
        alert("Save FORM fill ERROR!!!")
        return;
    }
    if (levelVal > 100) {
        alert("MIN level 0 / MAX level is 100")
    }

    birthdayVal = new Date(birthdayVal).getTime();

    $.ajax({
        type: 'POST',
        url: 'rest/players',
        data: JSON.stringify({
            name: nameVal,
            title: titleVal,
            race: raceVal,
            profession: profVal,
            birthday: birthdayVal,
            banned: banVal,
            level: levelVal
        }),
        success: function (data) {
            getPers(currentPersonsCntView);
        },
        contentType: "application/json",
        dataType: 'json'
    });

   /* {
    “name”:[String],
  “title”:[String],
  “race”:[Race],
  “profession”:[Profession],
  “birthday”:[Long],
  “banned”:[Boolean], --optional, default=false
  “level”:[Integer]
    }*/
    return false;
}





