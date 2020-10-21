exports.getDate = function(){
    let today = (new Date()).toString().split(' ').splice(1,3).join(' ');
    return today;
}