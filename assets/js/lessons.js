/* The one list of lessons: grade → topics → lessons. Everything else reads it from here:
   the home page (index.html draws its grid and map from it) and game.js (Core.LESSONS, Core.topicLessons,
   Core.TOPIC_NAMES, used by the lesson pages, the boss challenge and the teacher page).
   index.html loads this file with a script tag before core.js; on other pages core.js loads it before game.js.
   n = number shown to the learner, t = title, id = key of the lesson's stars,
   stars = number of activities that give a star (must match data-stars-total in the lesson page).
   The page of a lesson is found from its id: 'l5-b08a' → 'lop5/bai08a.html' (href is filled in below). ES5. */
window.LESSON_GRADES = {
  '4': [
    { topic: 'Chủ đề 1. Máy tính và em', lessons: [
      { n: 1, t: 'Phần cứng và phần mềm máy tính', id: 'l4-b01', stars: 9 },
      { n: 2, t: 'Gõ bàn phím đúng cách', id: 'l4-b02', stars: 11 } ] },
    { topic: 'Chủ đề 2. Mạng máy tính và Internet', lessons: [ { n: 3, t: 'Thông tin trên trang web', id: 'l4-b03', stars: 11 } ] },
    { topic: 'Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', lessons: [
      { n: 4, t: 'Tìm kiếm thông tin trên Internet', id: 'l4-b04', stars: 11 }, { n: 5, t: 'Thao tác với tệp và thư mục', id: 'l4-b05', stars: 13 } ] },
    { topic: 'Chủ đề 4. Đạo đức, pháp luật và văn hoá trong môi trường số', lessons: [ { n: 6, t: 'Sử dụng phần mềm khi được phép', id: 'l4-b06', stars: 10 } ] },
    { topic: 'Chủ đề 5. Ứng dụng tin học', lessons: [
      { n: 7, t: 'Tạo bài trình chiếu', id: 'l4-b07', stars: 11 }, { n: 8, t: 'Định dạng văn bản trên trang chiếu', id: 'l4-b08', stars: 10 }, { n: 9, t: 'Hiệu ứng chuyển trang', id: 'l4-b09', stars: 9 },
      { n: 10, t: 'Phần mềm soạn thảo văn bản', id: 'l4-b10', stars: 10 }, { n: 11, t: 'Chỉnh sửa văn bản', id: 'l4-b11', stars: 12 },
      { n: '12A', t: 'Thực hành sử dụng công cụ đa phương tiện', id: 'l4-b12a', stars: 5 }, { n: '12B', t: 'Phần mềm luyện gõ bàn phím', id: 'l4-b12b', stars: 6 } ] },
    { topic: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', lessons: [
      { n: 13, t: 'Chơi với máy tính', id: 'l4-b13', stars: 9 }, { n: 14, t: 'Khám phá môi trường lập trình trực quan', id: 'l4-b14', stars: 9 },
      { n: 15, t: 'Tạo chương trình máy tính để diễn tả ý tưởng', id: 'l4-b15', stars: 9 }, { n: 16, t: 'Chương trình của em', id: 'l4-b16', stars: 7 } ] }
  ],
  '5': [
    { topic: 'Chủ đề 1. Máy tính và em', lessons: [ { n: 1, t: 'Em có thể làm gì với máy tính?', id: 'l5-b01', stars: 6 } ] },
    { topic: 'Chủ đề 2. Mạng máy tính và Internet', lessons: [ { n: 2, t: 'Tìm kiếm thông tin trên website', id: 'l5-b02', stars: 9 } ] },
    { topic: 'Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', lessons: [
      { n: 3, t: 'Tìm kiếm thông tin trong giải quyết vấn đề', id: 'l5-b03', stars: 10 }, { n: 4, t: 'Cây thư mục', id: 'l5-b04', stars: 15 } ] },
    { topic: 'Chủ đề 4. Đạo đức, pháp luật và văn hoá trong môi trường số', lessons: [ { n: 5, t: 'Bản quyền nội dung thông tin', id: 'l5-b05', stars: 11 } ] },
    { topic: 'Chủ đề 5. Ứng dụng tin học', lessons: [
      { n: 6, t: 'Định dạng kí tự và bố trí hình ảnh trong văn bản', id: 'l5-b06', stars: 13 }, { n: 7, t: 'Thực hành soạn thảo văn bản', id: 'l5-b07', stars: 10 },
      { n: '8A', t: 'Làm quen với phần mềm đồ hoạ', id: 'l5-b08a', stars: 14 }, { n: '9A', t: 'Sử dụng phần mềm đồ hoạ tạo sản phẩm số', id: 'l5-b09a', stars: 8 },
      { n: '8B', t: 'Làm sản phẩm thủ công theo video hướng dẫn', id: 'l5-b08b', stars: 10 }, { n: '9B', t: 'Thực hành tạo đồ dùng gia đình theo video hướng dẫn', id: 'l5-b09b', stars: 9 } ] },
    { topic: 'Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', lessons: [
      { n: 10, t: 'Cấu trúc tuần tự', id: 'l5-b10', stars: 10 },
      { n: 11, t: 'Cấu trúc lặp', id: 'l5-b11', stars: 10 },
      { n: 12, t: 'Thực hành sử dụng lệnh lặp', id: 'l5-b12', stars: 9 }, { n: 13, t: 'Cấu trúc rẽ nhánh', id: 'l5-b13', stars: 10 },
      { n: 14, t: 'Sử dụng biến trong chương trình', id: 'l5-b14', stars: 11 }, { n: 15, t: 'Sử dụng biểu thức trong chương trình', id: 'l5-b15', stars: 10 },
      { n: 16, t: 'Từ kịch bản đến chương trình', id: 'l5-b16', stars: 10 } ] }
  ]
};
(function () {
  var G = window.LESSON_GRADES, g, i, k;
  for (g in G) if (G.hasOwnProperty(g)) for (i = 0; i < G[g].length; i++) for (k = 0; k < G[g][i].lessons.length; k++) {
    var l = G[g][i].lessons[k];
    l.href = l.id.replace(/^l(\d)-b/, 'lop$1/bai') + '.html';
  }
})();
