//return correct image url
app.filter('getImage', function () {
    return function (imgLink) {
        if (imgLink === undefined || imgLink === null) {
            return BASE_URL + 'image/default.png';
        }
        return BASE_URL + ' image/' + imgLink;
    };
});
