-- Sample things from src/data/items.ts. Photos stay on the site under /images/cutouts.
-- Run after schema.sql if you want the shop to start with these; delete them later from the admin.
insert into public.items (id, name, category, origin, description, price, height_cm, image, image_w, image_h, shelf, sold, added_at) values
  ('girl-after-bathing', 'Девочка после купания', 'porcelain', 'ЛФЗ, 1960-е', '', 38000, 24, '/images/cutouts/figurine.webp', 395, 900, 1, false, '2026-10-28'),
  ('girl-with-flowers', 'Девушка с цветами', 'porcelain', 'Германия, XIX век', '', 45000, 21, '/images/cutouts/girl-porcelain.webp', 337, 884, 2, false, '2026-10-12'),
  ('man-with-grapes', 'Кавалер с виноградом', 'porcelain', 'Германия, XIX век', '', 45000, 21, '/images/cutouts/man-grapes.webp', 356, 878, 3, false, '2026-10-12'),
  ('teapot-bamboo', 'Чайник «Стебли бамбука»', 'china', 'Китай', '', 67000, 17, '/images/cutouts/teapot-bianhu.webp', 782, 817, 1, false, '2026-09-30'),
  ('hexagonal-vase', 'Ваза шестигранная', 'china', 'Китай, селадон', '', 85000, 19, '/images/cutouts/vase-hex.webp', 680, 617, 2, false, '2026-10-20'),
  ('vase-peonies', 'Ваза с пионами', 'china', 'Китай, резной узор', '', null, 30, '/images/cutouts/jar-peonies.webp', 521, 900, 3, false, '2026-08-14'),
  ('buddha-amitabha', 'Будда Амитабха', 'china', 'серебрение, XIX век', '', 50000, 26, '/images/cutouts/buddha.webp', 632, 799, null, false, '2026-07-02'),
  ('candlestick-crest', 'Подсвечник с гербом', 'china', 'Китай, экспорт', '', null, 25, '/images/cutouts/candlestick.webp', 348, 900, null, false, '2026-06-18'),
  ('lion', 'Лев', 'bronze', 'бронза, конец XIX века', '', 115000, 14, '/images/cutouts/lion.webp', 900, 671, 1, false, '2026-10-30'),
  ('wall-clock', 'Настенные часы', 'bronze', 'бронза, позолота', '', null, 60, '/images/cutouts/wall-clock.webp', 429, 900, 2, false, '2026-09-05'),
  ('candelabrum', 'Канделябр', 'bronze', 'позолота, камень', '', 140000, 28, '/images/cutouts/candelabrum.webp', 634, 518, 3, false, '2026-10-02'),
  ('inkstand-crab', 'Чернильница «Краб»', 'bronze', 'бронза, стекло', '', 64000, 9, '/images/cutouts/inkstand-crab.webp', 488, 363, null, false, '2026-08-22'),
  ('teapot-worcester', 'Чайник с крышкой', 'tableware', 'Вустер, 1882', '', 54000, 15, '/images/cutouts/teapot-worcester.webp', 814, 749, null, false, '2026-07-19'),
  ('inkwell-pewter', 'Чернильница', 'tableware', 'олово, XIX век', '', 18000, 8, '/images/cutouts/inkwell.webp', 695, 900, null, true, '2026-05-10'),
  ('bust-paris', 'Бюст Париса', 'busts', 'по Канове, мрамор', '', 65000, 34, '/images/cutouts/bust-paris.webp', 382, 900, null, false, '2026-09-12')
on conflict (id) do nothing;
