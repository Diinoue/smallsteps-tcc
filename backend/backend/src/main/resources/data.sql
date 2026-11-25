-- =====================================================================
-- INSERTs de exemplo (PostgreSQL) - schema public
-- Ordem: usuario, comunidade, tag, tag_usuario, tag_comunidade,
--        participam, solicitam, post, evento, comentario, meta, sub_meta
-- Cobre todos os estados possiveis do aplicativo (ATIVO, PENDENTE,
-- CONGELADO, comunidades publicas/privadas, cargos DONO/ADMIN/MEMBRO,
-- solicitacoes pendentes, posts TEXT/IMAGE/VIDEO, comentarios, eventos,
-- metas concluidas com comprovante de midia e visivel true/false).
-- =====================================================================

-- ---------------------------------------------------------------------
-- USUARIO
-- Senha padrao para todos os usuarios de teste: 12345678
-- Hash BCrypt: $2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG
-- Estados de streak calculados por (ultima_atividade, ultimo_prazo, intervalo_atividade):
--   1 (Ana Souza)      -> PENDENTE  (ciclo 1 dia, streak_publico=true,  metas_publicas=true)
--   2 (Bruno Lima)     -> PENDENTE  (ciclo 3 dias, streak_publico=true, metas_publicas=true)
--   3 (Carla Mendes)   -> ATIVO     (ciclo 7 dias, streak_publico=true, metas_publicas=false)
--   4 (Diego Ferreira) -> CONGELADO (ciclo 2 dias, streak_publico=true, metas_publicas=true)
--   5 (Elisa Rocha)    -> ATIVO     (ciclo 1 dia, streak_publico=false, metas_publicas=true)
--   6 (Felipe Alves)   -> CONGELADO (ciclo 7 dias, streak_publico=false, metas_publicas=false)
--   7 (Gabriela Costa) -> ATIVO     (ciclo 14 dias, streak_publico=true, metas_publicas=true)
--   8 (Henrique Duarte)-> CONGELADO (ciclo 3 dias, streak_publico=true, metas_publicas=true)
--   9 (Isabela Martins)-> PENDENTE  (ciclo 7 dias, streak_publico=true, metas_publicas=true)
--  10 (Joao Pereira)   -> ATIVO     (ciclo 30 dias, streak_publico=true, metas_publicas=true)
-- ---------------------------------------------------------------------
INSERT INTO usuario (id, streak_num, intervalo_atividade, proximo_intervalo, ciclo_descongelamento, ultima_atividade, ultimo_prazo, descricao, email, nome, senha, foto, streak_publico, metas_publicas) VALUES
(1,  12, INTERVAL '1 day',   NULL, false, NOW() - INTERVAL '20 hours', NOW() + INTERVAL '12 hours', 'Apaixonada por corrida, piano e cafe especial.',          'ana.souza@email.com',        'Ana Souza',       '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', true,  true),
(2,   5, INTERVAL '3 days',  NULL, false, NOW() - INTERVAL '4 days',   NOW() + INTERVAL '1 day',    'Organizo treinos de corrida e trilhas nos fins de semana.', 'bruno.lima@email.com',      'Bruno Lima',      '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', true,  true),
(3,  30, INTERVAL '7 days',  NULL, false, NOW() - INTERVAL '1 day',    NOW() + INTERVAL '5 days',   'Leio um livro por semana e adoro fotografia.',            'carla.mendes@email.com',     'Carla Mendes',    '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', true,  false),
(4,   7, INTERVAL '2 days',  NULL, false, NOW() - INTERVAL '10 days',  NOW() - INTERVAL '5 days',   'Desenvolvedor backend apaixonado por bancos de dados.',   'diego.ferreira@email.com',   'Diego Ferreira',  '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', true,  true),
(5,   8, INTERVAL '1 day',   NULL, false, NOW() - INTERVAL '2 hours',  NOW() + INTERVAL '18 hours', 'Meditacao e yoga todas as manhas.',                       'elisa.rocha@email.com',      'Elisa Rocha',     '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', false, true),
(6,   3, INTERVAL '7 days',  NULL, false, NOW() - INTERVAL '28 days',  NOW() - INTERVAL '15 days',  'Voltando aos treinos de natacao e leitura.',              'felipe.alves@email.com',     'Felipe Alves',    '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', false, false),
(7,  21, INTERVAL '14 days', NULL, false, NOW() - INTERVAL '2 days',   NOW() + INTERVAL '11 days',  'Cultivo temperos na varanda e pratico compostagem.',      'gabriela.costa@email.com',   'Gabriela Costa',  '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', true,  true),
(8,   4, INTERVAL '3 days',  NULL, false, NOW() - INTERVAL '19 days',  NOW() - INTERVAL '12 days',  'Estudando para certificacoes cloud e xadrez.',            'henrique.duarte@email.com',  'Henrique Duarte', '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', true,  true),
(9,  15, INTERVAL '7 days',  NULL, false, NOW() - INTERVAL '5 days',   NOW() - INTERVAL '2 days',   'Gosto de tecnologia, jardinagem e fotografia analogica.', 'isabela.martins@email.com',  'Isabela Martins', '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', true,  true),
(10,  7, INTERVAL '30 days', NULL, false, NOW() - INTERVAL '1 day',    NOW() + INTERVAL '25 days',  'Instrutor de yoga e meditacao guiada.',                   'joao.pereira@email.com',     'João Pereira',    '$2a$10$bnYJsQKQ735u0V8tk/D5ku1I6zYF/dv/176iWedeD7WIO4u6wAqyG', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', true,  true);

-- ---------------------------------------------------------------------
-- COMUNIDADE (com descricoes completas e codigos de convite unicos)
--   1  (Publica,  #5b1c27) -> Ana e DONO
--   2  (Privada,  #a3f912) -> Ana NAO participa (bom para testar "Use link:" -> Solicitar)
--   3  (Publica,  #2e8b57) -> Ana e MEMBRO
--   4  (Publica,  #c49a6c) -> Ana NAO participa (aparece no Find Community)
--   5  (Privada,  #7d4e99) -> Ana e ADMINISTRADOR (tem solicitacoes pendentes!)
--   6..13 (Publicas)       -> Ana NAO participa (aparecem no Find Community)
--  14  (Privada,  #11ab42) -> Ana e DONO (tem solicitacoes pendentes + membros para promover/expulsar)
--  15  (Privada,  #f4a261) -> Ana JA SOLICITOU entrada (testar estado "Pendente" no modal por codigo)
-- ---------------------------------------------------------------------
INSERT INTO comunidade (id, privado, dt_criacao, foto, nome, descricao, codigo_convite) VALUES
(1,  false, '2026-01-10 10:00:00', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=150&auto=format&fit=crop&q=80', 'Corredores de Fim de Semana', 'Grupo para quem corre 5k, 10k ou meia maratona aos sabados e domingos, com dicas de treino e encontros no parque.', '#5b1c27'),
(2,  true,  '2026-02-15 14:30:00', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&auto=format&fit=crop&q=80', 'Clube do Livro',              'Leituras mensais de classicos e contemporaneos com debates semanais e resenhas colaborativas.',                   '#a3f912'),
(3,  false, '2026-03-05 09:00:00', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&auto=format&fit=crop&q=80', 'Devs em Estudo',              'Comunidade de programadores compartilhando metas de estudo, projetos open source e dicas de arquitetura.',          '#2e8b57'),
(4,  false, '2026-04-20 16:45:00', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=150&auto=format&fit=crop&q=80', 'Hortas Urbanas',              'Cultivo de temperos, hortalicas e compostagem caseira em apartamentos e quintais.',                                 '#c49a6c'),
(5,  true,  '2026-05-01 07:00:00', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150&auto=format&fit=crop&q=80', 'Meditação Diária',            'Praticas diarias de atencao plena, respiracao guiada e habito de desacelerar antes de comecar o dia.',              '#7d4e99'),
(6,  false, '2026-05-10 11:00:00', 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=150&auto=format&fit=crop&q=80', 'Sk8 Tarumã',                  'Sessoes de skate street e bowl para iniciantes e veteranos na pista do Taruma.',                                    '#ff6b35'),
(7,  false, '2026-05-15 15:30:00', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=80', 'Corredores do Tingui',        'Treinos leves e intervalados no Parque Tingui todas as tercas e quintas ao amanhecer.',                            '#3a86ff'),
(8,  false, '2026-05-20 09:00:00', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&auto=format&fit=crop&q=80', 'Desbravadores CWB',           'Trilhas ecologicas, montanhismo e escalada na Serra do Mar paranaense.',                                           '#8338ec'),
(9,  false, '2026-05-25 14:00:00', NULL,                                                                                           'Roller Wizards',              'Patins inline e quad para passeios noturnos urbanos e aprendizado de manobras basicas.',                           '#fb5607'),
(10, false, '2026-06-01 10:00:00', NULL,                                                                                           'Hydroentusiastas',            'Grupo dedicado a natacao em piscina e aguas abertas com desafios mensais de metragem.',                            '#00b4d8'),
(11, false, '2026-06-05 16:00:00', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80', 'StreetArt Grafite CWB',       'Troca de tecnicas de desenho, stencil e murais urbanos pela cidade.',                                              '#e63946'),
(12, false, '2026-06-10 18:00:00', NULL,                                                                                           'BookWorm',                    'Desafios de leitura diaria para quem quer ler pelo menos 20 paginas por dia.',                                     '#457b9d'),
(13, false, '2026-06-12 19:30:00', NULL,                                                                                           'Badminton Bigorrilho',        'Partidas amistosas e treinos de agilidade toda quarta-feira a noite.',                                             '#2a9d8f'),
(14, true,  '2026-06-15 14:00:00', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=150&auto=format&fit=crop&q=80', 'Piano & Harmonia',            'Comunidade privada para praticantes de piano compartilharem evolucao de pecas, leitura a primeira vista e teoria.', '#11ab42'),
(15, true,  '2026-06-20 11:00:00', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80', 'Fotografia Analógica',        'Espaco fechado para troca de revelacoes 35mm, dicas de exposicao e safaris fotograficos.',                         '#f4a261');

-- ---------------------------------------------------------------------
-- TAG (30 tags variadas para busca no banco)
-- ---------------------------------------------------------------------
INSERT INTO tag (id, descricao) VALUES
(1,  'Saúde'),
(2,  'Leitura'),
(3,  'Programação'),
(4,  'Esportes'),
(5,  'Meditação'),
(6,  'Sustentabilidade'),
(7,  'Produtividade'),
(8,  'Música'),
(9,  'Skate'),
(10, 'Corrida'),
(11, 'Casual'),
(12, 'Escalada'),
(13, 'Trilha'),
(14, 'Patins'),
(15, 'Piscina'),
(16, 'Grafite'),
(17, 'Arte'),
(18, 'Badminton'),
(19, 'Piano'),
(20, 'Fotografia'),
(21, 'Culinária'),
(22, 'Idiomas'),
(23, 'Yoga'),
(24, 'Ciclismo'),
(25, 'Xadrez'),
(26, 'Finanças'),
(27, 'Escrita'),
(28, 'Desenho'),
(29, 'Natação'),
(30, 'Cinema');

-- ---------------------------------------------------------------------
-- TAG_USUARIO (id_tag, id_usuario)
-- ---------------------------------------------------------------------
INSERT INTO tag_usuario (id_tag, id_usuario) VALUES
(10, 1), (19, 1), (1, 1), (8, 1),
(4, 2), (10, 2), (13, 2),
(2, 3), (7, 3), (20, 3),
(3, 4), (7, 4),
(5, 5), (1, 5), (23, 5),
(4, 6), (29, 6), (2, 6),
(6, 7), (21, 7),
(3, 8), (7, 8), (25, 8),
(3, 9), (6, 9), (20, 9),
(5, 10), (1, 10), (23, 10);

-- ---------------------------------------------------------------------
-- TAG_COMUNIDADE (id_comunidade, id_tag)
-- ---------------------------------------------------------------------
INSERT INTO tag_comunidade (id_comunidade, id_tag) VALUES
(1, 4), (1, 1), (1, 10),
(2, 2), (2, 27),
(3, 3), (3, 7),
(4, 6), (4, 21),
(5, 5), (5, 1), (5, 23),
(6, 9), (6, 4),
(7, 10), (7, 11),
(8, 12), (8, 13),
(9, 14), (9, 11),
(10, 15), (10, 29),
(11, 16), (11, 17), (11, 28),
(12, 2), (12, 7),
(13, 18), (13, 4),
(14, 19), (14, 8), (14, 17),
(15, 20), (15, 17);

-- ---------------------------------------------------------------------
-- PARTICIPAM (id_comunidade, id_usuario, pontos, dt_inicio, cargo, ultima_pontuacao)
-- cargo: MEMBRO | ADMINISTRADOR | DONO
-- ---------------------------------------------------------------------
INSERT INTO participam (id_comunidade, id_usuario, pontos, dt_inicio, cargo, ultima_pontuacao) VALUES
-- 1: Corredores de Fim de Semana (Publica) - Ana e DONO
(1, 1,  32, '2026-01-10 10:00:00', 'DONO',          NOW() - INTERVAL '2 days'),
(1, 2,  21, '2026-01-12 11:20:00', 'ADMINISTRADOR', NOW() - INTERVAL '3 days'),
(1, 3,   9, '2026-01-20 08:00:00', 'MEMBRO',        NOW() - INTERVAL '5 days'),
(1, 4,   4, '2026-02-01 18:30:00', 'MEMBRO',        NOW() - INTERVAL '13 days'),
(1, 5,  13, '2026-02-10 07:15:00', 'MEMBRO',        NOW() - INTERVAL '1 day'),
(1, 6,   7, '2026-03-01 08:00:00', 'MEMBRO',        NOW() - INTERVAL '28 days'),
-- 2: Clube do Livro (Privada) - Ana NAO participa
(2, 3,  45, '2026-02-15 14:30:00', 'DONO',          NOW() - INTERVAL '1 day'),
(2, 5,  18, '2026-02-16 09:00:00', 'ADMINISTRADOR', NOW() - INTERVAL '2 days'),
(2, 6,   6, '2026-03-01 20:00:00', 'MEMBRO',        NOW() - INTERVAL '28 days'),
(2, 7,   8, '2026-03-10 21:10:00', 'MEMBRO',        NOW() - INTERVAL '2 days'),
-- 3: Devs em Estudo (Publica) - Ana e MEMBRO
(3, 4,  50, '2026-03-05 09:00:00', 'DONO',          NOW() - INTERVAL '13 days'),
(3, 8,  26, '2026-03-06 10:30:00', 'ADMINISTRADOR', NOW() - INTERVAL '19 days'),
(3, 1,  11, '2026-03-15 19:00:00', 'MEMBRO',        NOW() - INTERVAL '2 days'),
(3, 2,   5, '2026-03-18 20:15:00', 'MEMBRO',        NOW() - INTERVAL '3 days'),
(3, 9,  19, '2026-03-20 08:45:00', 'MEMBRO',        NOW() - INTERVAL '5 days'),
(3, 10,  3, '2026-04-02 12:00:00', 'MEMBRO',        NOW() - INTERVAL '1 day'),
-- 4: Hortas Urbanas (Publica)
(4, 7,  38, '2026-04-20 16:45:00', 'DONO',          NOW() - INTERVAL '2 days'),
(4, 6,   4, '2026-05-02 10:00:00', 'MEMBRO',        NOW() - INTERVAL '28 days'),
(4, 9,  15, '2026-05-05 17:30:00', 'MEMBRO',        NOW() - INTERVAL '5 days'),
-- 5: Meditacao Diaria (Privada) - Ana e ADMINISTRADOR
(5, 10, 41, '2026-05-01 07:00:00', 'DONO',          NOW() - INTERVAL '1 day'),
(5, 1,  17, '2026-05-02 06:45:00', 'ADMINISTRADOR', NOW() - INTERVAL '2 hours'),
(5, 5,  22, '2026-05-03 06:30:00', 'MEMBRO',        NOW() - INTERVAL '1 hour'),
(5, 7,   9, '2026-05-10 06:30:00', 'MEMBRO',        NOW() - INTERVAL '2 days'),
-- 6..13: Comunidades publicas com membros para exibir contagem no modal
(6, 2,  14, '2026-05-10 11:00:00', 'DONO',          NOW() - INTERVAL '3 days'),
(6, 6,   8, '2026-05-12 15:00:00', 'MEMBRO',        NOW() - INTERVAL '28 days'),
(7, 2,  12, '2026-05-15 15:30:00', 'DONO',          NOW() - INTERVAL '3 days'),
(8, 2,  20, '2026-05-20 09:00:00', 'DONO',          NOW() - INTERVAL '3 days'),
(8, 4,  10, '2026-05-22 10:00:00', 'MEMBRO',        NOW() - INTERVAL '13 days'),
(9, 5,   9, '2026-05-25 14:00:00', 'DONO',          NOW() - INTERVAL '1 hour'),
(10, 6, 11, '2026-06-01 10:00:00', 'DONO',          NOW() - INTERVAL '28 days'),
(11, 9, 16, '2026-06-05 16:00:00', 'DONO',          NOW() - INTERVAL '5 days'),
(12, 3, 25, '2026-06-10 18:00:00', 'DONO',          NOW() - INTERVAL '1 day'),
(13, 8,  7, '2026-06-12 19:30:00', 'DONO',          NOW() - INTERVAL '19 days'),
-- 14: Piano & Harmonia (Privada) - Ana e DONO (testar todos poderes de DONO + solicitacoes)
(14, 1,  28, '2026-06-15 14:00:00', 'DONO',          NOW() - INTERVAL '2 days'),
(14, 3,  19, '2026-06-16 15:00:00', 'ADMINISTRADOR', NOW() - INTERVAL '1 day'),
(14, 5,  12, '2026-06-18 19:00:00', 'MEMBRO',        NOW() - INTERVAL '1 hour'),
(14, 10,  8, '2026-06-20 20:00:00', 'MEMBRO',        NOW() - INTERVAL '1 day'),
-- 15: Fotografia Analogica (Privada) - Ana ja solicitou entrada
(15, 9,  24, '2026-06-20 11:00:00', 'DONO',          NOW() - INTERVAL '5 days'),
(15, 3,  15, '2026-06-21 11:30:00', 'ADMINISTRADOR', NOW() - INTERVAL '1 day');

-- ---------------------------------------------------------------------
-- SOLICITAM (id_comunidade, id_usuario, dt_inicio)
-- Pedidos pendentes em comunidades privadas
-- ---------------------------------------------------------------------
INSERT INTO solicitam (id_comunidade, id_usuario, dt_inicio) VALUES
(2,  4,  NOW() - INTERVAL '5 days'),
(2,  8,  NOW() - INTERVAL '3 days'),
(5,  3,  NOW() - INTERVAL '2 days'),
(5,  9,  NOW() - INTERVAL '1 day'),
(14, 2,  NOW() - INTERVAL '2 days'),
(14, 4,  NOW() - INTERVAL '1 day'),
(14, 8,  NOW() - INTERVAL '6 hours'),
(15, 1,  NOW() - INTERVAL '1 day');

-- ---------------------------------------------------------------------
-- POST (TEXT, IMAGE e VIDEO em multiplas comunidades para testar feed e busca)
-- ---------------------------------------------------------------------
INSERT INTO post (id, id_comunidade, id_usuario, dt_criacao, descricao, tipo_midia, url_midia) VALUES
-- Comunidade 1: Corredores de Fim de Semana
(1,  1, 1,  NOW() - INTERVAL '5 days',  'Bom dia, pessoal! Quem topa uma corrida de 5 km no domingo de manha?',                                            'TEXT',  NULL),
(2,  1, 2,  NOW() - INTERVAL '4 days',  'Dica de treino: alongar por 10 minutos depois da corrida reduz muito a dor muscular.',                             'TEXT',  NULL),
(3,  1, 5,  NOW() - INTERVAL '3 days',  'Completei meus primeiros 10 km sem parar hoje cedo! Vista incrivel no parque.',                                    'IMAGE', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'),
(4,  1, 1,  NOW() - INTERVAL '1 day',   'Treino intervalado de tiros de 400m concluido! Preparacao firme para a meia maratona.',                            'IMAGE', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800'),
(5,  1, 3,  NOW() - INTERVAL '8 hours', 'Alguem tem recomendacao de tenis leve para corrida no asfalto?',                                                   'TEXT',  NULL),
-- Comunidade 2: Clube do Livro
(6,  2, 3,  NOW() - INTERVAL '4 days',  'O livro do mes sera "Dom Casmurro". Vamos discutir no dia 30!',                                                    'IMAGE', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'),
(7,  2, 5,  NOW() - INTERVAL '2 days',  'Ja passei da metade da leitura e estou anotando varios trechos para o nosso debate.',                              'TEXT',  NULL),
-- Comunidade 3: Devs em Estudo
(8,  3, 4,  NOW() - INTERVAL '5 days',  'Alguem tem recomendacao de curso de PostgreSQL para quem esta comecando?',                                         'TEXT',  NULL),
(9,  3, 9,  NOW() - INTERVAL '3 days',  'Compartilhando um resumo sobre indices B-tree e performance de consultas SQL.',                                    'TEXT',  NULL),
(10, 3, 1,  NOW() - INTERVAL '2 days',  'Finalizei minha primeira API REST em Spring Boot com autenticacao JWT!',                                         'IMAGE', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'),
(11, 3, 8,  NOW() - INTERVAL '12 hours','Dica: use EXPLAIN ANALYZE sempre antes de criar indices novos em tabelas grandes.',                                'TEXT',  NULL),
-- Comunidade 4: Hortas Urbanas
(12, 4, 7,  NOW() - INTERVAL '3 days',  'Minhas mudas de manjericao finalmente brotaram na varanda!',                                                       'IMAGE', 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800'),
-- Comunidade 5: Meditacao Diaria
(13, 5, 10, NOW() - INTERVAL '3 days',  'Sessao guiada de respiracao de 10 minutos hoje as 6h30. Confiram o video!',                                        'VIDEO', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
(14, 5, 5,  NOW() - INTERVAL '2 days',  'Consegui meditar 21 dias seguidos. Obrigada pelo apoio, grupo!',                                                   'TEXT',  NULL),
(15, 5, 1,  NOW() - INTERVAL '2 hours', 'Comecei o dia com 15 minutos de silencio e cafe. Faz toda diferenca no foco!',                                   'IMAGE', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
-- Comunidade 14: Piano & Harmonia
(16, 14, 1, NOW() - INTERVAL '4 days',  'Bem-vindos ao grupo Piano & Harmonia! Compartilhem qual peca estao estudando esta semana.',                        'TEXT',  NULL),
(17, 14, 3, NOW() - INTERVAL '2 days',  'Estou praticando Canon in D bem devagar com metronomo a 60 BPM.',                                                  'IMAGE', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800'),
(18, 14, 5, NOW() - INTERVAL '6 hours', 'Gravei um trecho curto do meu estudo de escalas maiores hoje!',                                                    'VIDEO', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');

-- ---------------------------------------------------------------------
-- EVENTO
-- ---------------------------------------------------------------------
INSERT INTO evento (id, id_comunidade, id_usuario, dia_inicio, dia_fim, horario_inicio, horario_fim, titulo, local, descricao, foto) VALUES
(1,  1,  1,  '2026-12-06', '2026-12-06', '07:00', '09:00', 'Corrida no Parque Barigui',     'Parque Barigui, portão principal', 'Corrida leve de 5 km seguida de café coletivo e alongamento.', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600'),
(2,  1,  2,  '2026-12-13', '2026-12-13', '06:30', '08:30', 'Treino Longão 12 km',           'Parque Tingui, pista central',     'Treino de resistência em ritmo conversacional para preparação de prova.', NULL),
(3,  2,  3,  '2026-12-10', '2026-12-10', '19:30', '21:30', 'Debate: Dom Casmurro',          'Biblioteca Central, sala 2',       'Discussão do livro do mês com lanche comunitário.', NULL),
(4,  3,  4,  '2026-12-12', '2026-12-13', '09:00', '17:00', 'Hackathon de Banco de Dados',   'Online (Google Meet)',             'Maratona de modelagem e otimização de consultas SQL.', NULL),
(5,  4,  7,  '2026-12-08', '2026-12-08', '10:00', '12:30', 'Oficina de Compostagem',        'Horta Comunitária da Vila',        'Aprenda a montar sua composteira caseira passo a passo.', NULL),
(6,  5,  10, '2026-12-14', '2026-12-14', '06:00', '08:00', 'Retiro de Meditação Matinal',   'Sítio Recanto Verde',              'Manhã de práticas guiadas, respiração consciente e silêncio.', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600'),
(7,  14, 1,  '2026-12-18', '2026-12-18', '19:00', '21:00', 'Sarau de Piano Online',         'Online (Discord)',                 'Apresentação informal de 3 minutos para cada membro tocar o que praticou no mês.', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600');

-- ---------------------------------------------------------------------
-- COMENTARIO (id_evento OU id_post preenchido; o outro fica NULL)
-- ---------------------------------------------------------------------
INSERT INTO comentario (id, id_evento, id_post, id_usuario, dt_criacao, conteudo) VALUES
(1,  NULL, 1,  2,  NOW() - INTERVAL '4 days',  'Eu topo! Levo agua e isotonico para todo mundo.'),
(2,  NULL, 1,  5,  NOW() - INTERVAL '4 days',  'Tambem vou, preciso testar meu tenis novo.'),
(3,  NULL, 3,  1,  NOW() - INTERVAL '2 days',  'Parabens Elisa! Os primeiros 10 km a gente nunca esquece!'),
(4,  NULL, 3,  2,  NOW() - INTERVAL '2 days',  'Mandou muito bem! Bora para os 15 km agora.'),
(5,  NULL, 4,  2,  NOW() - INTERVAL '20 hours','Tiros de 400m sao puxados demais, otimo ritmo Ana!'),
(6,  NULL, 8,  8,  NOW() - INTERVAL '4 days',  'Recomendo a documentacao oficial do PostgreSQL, e muito clara.'),
(7,  NULL, 10, 4,  NOW() - INTERVAL '1 day',   'Show demais Ana! Depois compartilha o repositorio com a gente.'),
(8,  NULL, 12, 9,  NOW() - INTERVAL '2 days',  'Que lindo! Quando crescer me passa uma muda?'),
(9,  NULL, 15, 10, NOW() - INTERVAL '1 hour',  'Consistencia e tudo, parabens pela pratica de hoje!'),
(10, NULL, 17, 1,  NOW() - INTERVAL '1 day',   'Estudar lento com metronomo e o segredo, vai ficar otimo!'),
(11, 1,    NULL, 3, NOW() - INTERVAL '2 days', 'Confirmado! Chego as 6h50.'),
(12, 3,    NULL, 7, NOW() - INTERVAL '2 days', 'Vou levar um bolo para o lanche.'),
(13, 4,    NULL, 1, NOW() - INTERVAL '1 day',  'Posso participar mesmo sendo iniciante?'),
(14, 6,    NULL, 1, NOW() - INTERVAL '1 day',  'Ja reservei minha vaga, mal posso esperar.');

-- ---------------------------------------------------------------------
-- META (com url_midia e tipo_midia nas conquistas concluidas + mix visivel true/false)
-- Usuario 1 (Ana Souza) possui:
--   - Metas em andamento visiveis (id 1, 7) e oculta (id 8)
--   - Meta com TODAS submetas concluidas pronta para clicar "Concluir Meta" (id 38)
--   - Metas concluidas (Achievements) com IMAGEM (id 6, 39) e VIDEO (id 40)
--     e uma concluida oculta (id 41, visivel=false) para testar selecao no Editar Perfil!
-- ---------------------------------------------------------------------
INSERT INTO meta (id, id_usuario, concluido, visivel, dt_inicio, dt_fim, titulo, milestone, url_midia, tipo_midia) VALUES
(1,  1,  false, true,  '2026-09-01 00:00:00', '2026-12-31 23:59:00', 'Correr uma meia maratona',                    'Completar os 21 km oficiais em menos de 2h',               NULL, NULL),
(2,  3,  false, true,  '2026-01-01 00:00:00', '2026-12-31 23:59:00', 'Ler 52 livros em 2026',                       'Completar a leitura e resenha dos 52 livros',              NULL, NULL),
(3,  4,  false, false, '2026-10-01 00:00:00', NULL,                  'Aprender PostgreSQL avançado',                'Certificação e otimização de queries em produção',         NULL, NULL),
(4,  5,  true,  true,  '2026-09-01 00:00:00', '2026-09-30 23:59:00', 'Meditar 30 dias seguidos',                    'Completar os 30 dias ininterruptos de prática matinal',    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 'IMAGE'),
(5,  7,  false, true,  '2026-04-20 00:00:00', '2026-11-30 23:59:00', 'Montar horta com 10 espécies',                'Colheita própria de temperos e hortaliças frescas',        NULL, NULL),
(6,  1,  true,  true,  '2026-01-05 00:00:00', '2026-04-05 23:59:00', 'Treinar 3x por semana durante 3 meses',       'Consistência física de 12 semanas completadas',            'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800', 'IMAGE'),
(7,  1,  false, true,  '2026-10-01 00:00:00', '2026-12-20 23:59:00', 'Baixar o tempo dos 5 km para 25 minutos',     'Bater o recorde pessoal de 25 min nos 5 km',               NULL, NULL),
(8,  1,  false, false, '2026-10-10 00:00:00', NULL,                  'Aprender a preparar cafés especiais',         'Dominar métodos de extração V60 e Aeropress',              NULL, NULL),
(9,  2,  true,  true,  '2026-02-01 00:00:00', '2026-05-31 23:59:00', 'Organizar 12 treinos de fim de semana',       '12 encontros do grupo realizados com sucesso',             'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800', 'IMAGE'),
(10, 2,  false, true,  '2026-09-01 00:00:00', '2026-12-31 23:59:00', 'Completar 10 km em menos de 55 minutos',      'Tempo sub-55 nos 10 km em prova oficial',                  NULL, NULL),
(11, 2,  false, false, '2026-10-15 00:00:00', NULL,                  'Fazer check-up médico completo',              'Todos os exames realizados e validados pelo médico',       NULL, NULL),
(12, 3,  true,  true,  '2026-01-01 00:00:00', '2026-03-31 23:59:00', 'Escrever 10 resenhas de livros',              'Publicar as 10 resenhas na comunidade',                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 'IMAGE'),
(13, 3,  false, true,  '2026-07-01 00:00:00', '2026-12-15 23:59:00', 'Ler 3 clássicos da literatura brasileira',    'Leitura concluída com notas de estudo',                    NULL, NULL),
(14, 3,  false, false, '2026-08-01 00:00:00', NULL,                  'Organizar a estante e catalogar o acervo',    'Catálogo digital completo de 100% dos livros',             NULL, NULL),
(15, 3,  true,  true,  '2026-05-01 00:00:00', '2026-06-30 23:59:00', 'Ler 30 minutos por dia durante 60 dias',      '60 dias ininterruptos de leitura diária',                  NULL, NULL),
(16, 4,  false, true,  '2026-03-05 00:00:00', '2026-12-31 23:59:00', 'Contribuir com um projeto open source',       'Pull request aprovado e integrado em projeto público',     NULL, NULL),
(17, 4,  false, true,  '2026-09-15 00:00:00', '2026-12-31 23:59:00', 'Tirar certificação em banco de dados',        'Aprovação no exame oficial de certificação',               NULL, NULL),
(18, 5,  false, true,  '2026-10-01 00:00:00', '2026-12-31 23:59:00', 'Criar uma rotina de sono saudável',           'Dormir e acordar no mesmo horário por 30 dias',            NULL, NULL),
(19, 6,  true,  true,  '2026-01-10 00:00:00', '2026-04-10 23:59:00', 'Voltar a treinar após a lesão',               'Liberado pelo fisioterapeuta para treinos normais',        NULL, NULL),
(20, 6,  false, true,  '2026-06-01 00:00:00', '2026-12-31 23:59:00', 'Nadar 1 km sem parar',                        'Bater 1000m contínuos na piscina',                         NULL, NULL),
(21, 6,  false, true,  '2026-10-01 00:00:00', '2026-11-30 23:59:00', 'Ler 3 livros sobre formação de hábitos',      'Conclusão das 3 leituras com plano de ação prático',       NULL, NULL),
(22, 6,  false, false, '2026-09-20 00:00:00', NULL,                  'Começar uma horta de ervas',                  'Ervas frescas prontas para consumo diário',                NULL, NULL),
(23, 7,  true,  true,  '2026-01-15 00:00:00', '2026-03-15 23:59:00', 'Montar uma composteira caseira',              'Composteira ativa produzindo húmus de qualidade',          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 'IMAGE'),
(24, 7,  false, true,  '2026-08-01 00:00:00', '2026-12-20 23:59:00', 'Cultivar 5 temperos na varanda',              'Vasos montados com colheita semanal',                      NULL, NULL),
(25, 7,  false, true,  '2026-10-01 00:00:00', '2026-11-30 23:59:00', 'Organizar a oficina de compostagem',          'Oficina comunitária realizada com 15 participantes',       NULL, NULL),
(26, 7,  true,  false, '2026-02-01 00:00:00', '2026-04-30 23:59:00', 'Ler 3 livros sobre permacultura',             'Aplicação prática dos princípios no jardim comunitário',   NULL, NULL),
(27, 7,  false, false, '2026-09-01 00:00:00', NULL,                  'Criar um blog de receitas com temperos',      '10 primeiras receitas publicadas',                         NULL, NULL),
(28, 8,  false, true,  '2026-09-01 00:00:00', '2026-12-31 23:59:00', 'Passar na certificação AWS Cloud Practitioner','Certificado oficial obtido',                              NULL, NULL),
(29, 8,  false, false, '2026-10-01 00:00:00', NULL,                  'Montar um portfólio de projetos',             'Site pessoal no ar com 3 projetos completos',              NULL, NULL),
(30, 9,  true,  true,  '2026-03-20 00:00:00', '2026-06-30 23:59:00', 'Estudar performance de consultas SQL',        'Otimização de 5 queries complexas documentadas',           NULL, NULL),
(31, 9,  false, true,  '2026-09-01 00:00:00', '2026-12-31 23:59:00', 'Concluir curso de modelagem de dados',        'Certificado de conclusão do curso',                        NULL, NULL),
(32, 9,  false, true,  '2026-05-05 00:00:00', '2026-11-30 23:59:00', 'Plantar 8 mudas na horta comunitária',        'Mudas estabelecidas e crescendo',                          NULL, NULL),
(33, 9,  true,  false, '2026-01-01 00:00:00', '2026-02-28 23:59:00', 'Organizar as finanças pessoais',              'Orçamento anual estruturado e reserva iniciada',           NULL, NULL),
(34, 9,  false, true,  '2026-10-15 00:00:00', '2026-12-31 23:59:00', 'Escrever 4 artigos técnicos',                 '4 artigos publicados no Dev.to',                           NULL, NULL),
(35, 10, true,  true,  '2026-05-01 00:00:00', '2026-08-31 23:59:00', 'Conduzir 20 sessões de meditação guiada',     '20 sessões gravadas e disponibilizadas',                   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'VIDEO'),
(36, 10, false, true,  '2026-09-01 00:00:00', '2026-12-15 23:59:00', 'Concluir a formação em yoga avançado',        'Diploma de formação avançada em mãos',                     NULL, NULL),
(37, 10, false, false, '2026-10-10 00:00:00', NULL,                  'Organizar o retiro de meditação',             'Retiro de final de semana realizado',                      NULL, NULL),
-- Metas extras da Ana (id 1) para demonstrar todos os estados de conclusao e comprovante de midia
(38, 1,  false, true,  '2026-08-01 00:00:00', NULL,                  'Tocar Canon in D no piano',                   'Executar a peça inteira sem pausas a 80 BPM',              NULL, NULL),
(39, 1,  true,  true,  '2026-05-10 00:00:00', '2026-07-15 23:59:00', 'Completar primeira corrida de 10 km',         'Cruzar a linha de chegada abaixo de 1 hora',               'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800', 'IMAGE'),
(40, 1,  true,  true,  '2026-06-01 00:00:00', '2026-09-10 23:59:00', 'Gravar Prelude No. 1 no piano',               'Publicar gravação completa em vídeo',                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'VIDEO'),
(41, 1,  true,  false, '2026-08-01 00:00:00', '2026-09-01 23:59:00', '30 dias sem açúcar refinado',                 'Completar o desafio de 30 dias consecutivos',              NULL, NULL);

-- ---------------------------------------------------------------------
-- SUB_META
-- ---------------------------------------------------------------------
INSERT INTO sub_meta (id, id_meta, pos, concluido, dt_inicio, dt_fim, titulo) VALUES
(1,  1,  1, true,  '2026-09-01 00:00:00', '2026-09-30 23:59:00', 'Correr 5 km sem parar'),
(2,  1,  2, true,  '2026-10-01 00:00:00', '2026-10-15 23:59:00', 'Correr 10 km'),
(3,  1,  3, false, '2026-10-16 00:00:00', NULL,                  'Correr 15 km'),
(4,  2,  1, true,  '2026-01-01 00:00:00', '2026-06-30 23:59:00', 'Ler 26 livros até junho'),
(5,  2,  2, false, '2026-07-01 00:00:00', NULL,                  'Ler 26 livros no segundo semestre'),
(6,  3,  1, true,  '2026-10-01 00:00:00', '2026-10-10 23:59:00', 'Estudar índices B-tree'),
(7,  3,  2, false, '2026-10-11 00:00:00', NULL,                  'Estudar EXPLAIN ANALYZE'),
(8,  4,  1, true,  '2026-09-01 00:00:00', '2026-09-30 23:59:00', 'Meditar 10 minutos por dia'),
(9,  5,  1, true,  '2026-04-20 00:00:00', '2026-05-10 23:59:00', 'Preparar os vasos e o substrato'),
(10, 5,  2, false, '2026-05-11 00:00:00', NULL,                  'Plantar 10 espécies diferentes'),
(11, 6,  1, true,  '2026-01-05 00:00:00', '2026-02-04 23:59:00', 'Montar planilha de treinos'),
(12, 6,  2, true,  '2026-02-05 00:00:00', '2026-03-06 23:59:00', 'Completar 6 semanas seguidas'),
(13, 6,  3, true,  '2026-03-07 00:00:00', '2026-04-05 23:59:00', 'Completar 12 semanas seguidas'),
(14, 7,  1, true,  '2026-10-01 00:00:00', '2026-10-24 23:59:00', 'Fazer teste de base'),
(15, 7,  2, false, '2026-10-25 00:00:00', NULL,                  'Incluir treino intervalado semanal'),
(16, 7,  3, false, '2026-10-25 00:00:00', NULL,                  'Fazer teste final'),
(17, 8,  1, true,  '2026-10-10 00:00:00', '2026-10-24 23:59:00', 'Comprar moedor e coador'),
(18, 8,  2, false, '2026-10-25 00:00:00', NULL,                  'Provar 5 grãos diferentes'),
(19, 9,  1, true,  '2026-02-01 00:00:00', '2026-03-13 23:59:00', 'Definir roteiros'),
(20, 9,  2, true,  '2026-03-14 00:00:00', '2026-04-21 23:59:00', 'Divulgar na comunidade'),
(21, 9,  3, true,  '2026-04-22 00:00:00', '2026-05-31 23:59:00', 'Realizar os 12 treinos'),
(22, 10, 1, true,  '2026-09-01 00:00:00', '2026-10-24 23:59:00', 'Correr 8 km sem parar'),
(23, 10, 2, false, '2026-10-25 00:00:00', NULL,                  'Correr 10 km sem parar'),
(24, 10, 3, false, '2026-10-25 00:00:00', NULL,                  'Baixar o ritmo para 5:30/km'),
(25, 11, 1, true,  '2026-10-15 00:00:00', '2026-10-24 23:59:00', 'Agendar consulta'),
(26, 11, 2, false, '2026-10-25 00:00:00', NULL,                  'Fazer os exames'),
(27, 12, 1, true,  '2026-01-01 00:00:00', '2026-01-31 23:59:00', 'Escolher os 10 livros'),
(28, 12, 2, true,  '2026-02-01 00:00:00', '2026-03-01 23:59:00', 'Escrever 5 resenhas'),
(29, 12, 3, true,  '2026-03-02 00:00:00', '2026-03-31 23:59:00', 'Escrever 10 resenhas'),
(30, 13, 1, true,  '2026-07-01 00:00:00', '2026-10-24 23:59:00', 'Ler Memórias Póstumas de Brás Cubas'),
(31, 13, 2, false, '2026-10-25 00:00:00', NULL,                  'Ler Dom Casmurro'),
(32, 13, 3, false, '2026-10-25 00:00:00', NULL,                  'Ler Grande Sertão: Veredas'),
(33, 14, 1, true,  '2026-08-01 00:00:00', '2026-10-24 23:59:00', 'Separar livros para doação'),
(34, 14, 2, false, '2026-10-25 00:00:00', NULL,                  'Catalogar os livros em planilha'),
(35, 15, 1, true,  '2026-05-01 00:00:00', '2026-05-21 23:59:00', 'Criar a rotina de leitura'),
(36, 15, 2, true,  '2026-05-22 00:00:00', '2026-06-10 23:59:00', 'Cumprir 30 dias'),
(37, 15, 3, true,  '2026-06-11 00:00:00', '2026-06-30 23:59:00', 'Cumprir 60 dias'),
(38, 16, 1, true,  '2026-03-05 00:00:00', '2026-10-24 23:59:00', 'Escolher o projeto'),
(39, 16, 2, false, '2026-10-25 00:00:00', NULL,                  'Resolver a primeira issue'),
(40, 16, 3, false, '2026-10-25 00:00:00', NULL,                  'Abrir um pull request aceito'),
(41, 17, 1, true,  '2026-09-15 00:00:00', '2026-10-24 23:59:00', 'Revisar modelo relacional'),
(42, 17, 2, false, '2026-10-25 00:00:00', NULL,                  'Fazer 3 simulados'),
(43, 17, 3, false, '2026-10-25 00:00:00', NULL,                  'Agendar e fazer a prova'),
(44, 18, 1, true,  '2026-10-01 00:00:00', '2026-10-24 23:59:00', 'Dormir antes das 23h por 2 semanas'),
(45, 18, 2, false, '2026-10-25 00:00:00', NULL,                  'Reduzir telas à noite'),
(46, 18, 3, false, '2026-10-25 00:00:00', NULL,                  'Manter a rotina por 30 dias'),
(47, 19, 1, true,  '2026-01-10 00:00:00', '2026-02-09 23:59:00', 'Concluir a fisioterapia'),
(48, 19, 2, true,  '2026-02-10 00:00:00', '2026-03-11 23:59:00', 'Fazer caminhadas de 30 minutos'),
(49, 19, 3, true,  '2026-03-12 00:00:00', '2026-04-10 23:59:00', 'Correr 3 km leves'),
(50, 20, 1, true,  '2026-06-01 00:00:00', '2026-08-12 23:59:00', 'Fazer aulas de natação'),
(51, 20, 2, true,  '2026-08-13 00:00:00', '2026-10-24 23:59:00', 'Nadar 500 m sem parar'),
(52, 20, 3, false, '2026-10-25 00:00:00', NULL,                  'Nadar 1 km sem parar'),
(53, 21, 1, true,  '2026-10-01 00:00:00', '2026-10-24 23:59:00', 'Ler o primeiro livro'),
(54, 21, 2, false, '2026-10-25 00:00:00', NULL,                  'Ler o segundo livro'),
(55, 21, 3, false, '2026-10-25 00:00:00', NULL,                  'Ler o terceiro livro'),
(56, 22, 1, true,  '2026-09-20 00:00:00', '2026-10-24 23:59:00', 'Comprar vasos e terra'),
(57, 22, 2, false, '2026-10-25 00:00:00', NULL,                  'Plantar hortelã e salsa'),
(58, 23, 1, true,  '2026-01-15 00:00:00', '2026-02-04 23:59:00', 'Pesquisar modelos'),
(59, 23, 2, true,  '2026-02-05 00:00:00', '2026-02-23 23:59:00', 'Montar a composteira'),
(60, 23, 3, true,  '2026-02-24 00:00:00', '2026-03-15 23:59:00', 'Colher o primeiro composto'),
(61, 24, 1, true,  '2026-08-01 00:00:00', '2026-10-24 23:59:00', 'Plantar manjericão e hortelã'),
(62, 24, 2, false, '2026-10-25 00:00:00', NULL,                  'Plantar alecrim e salsa'),
(63, 24, 3, false, '2026-10-25 00:00:00', NULL,                  'Fazer a primeira colheita'),
(64, 25, 1, true,  '2026-10-01 00:00:00', '2026-10-24 23:59:00', 'Reservar o espaço'),
(65, 25, 2, false, '2026-10-25 00:00:00', NULL,                  'Divulgar o evento'),
(66, 25, 3, false, '2026-10-25 00:00:00', NULL,                  'Realizar a oficina'),
(67, 26, 1, true,  '2026-02-01 00:00:00', '2026-03-02 23:59:00', 'Ler o primeiro livro'),
(68, 26, 2, true,  '2026-03-03 00:00:00', '2026-04-01 23:59:00', 'Ler o segundo livro'),
(69, 26, 3, true,  '2026-04-02 00:00:00', '2026-04-30 23:59:00', 'Ler o terceiro livro'),
(70, 27, 1, true,  '2026-09-01 00:00:00', '2026-10-24 23:59:00', 'Escolher a plataforma'),
(71, 27, 2, false, '2026-10-25 00:00:00', NULL,                  'Publicar 5 receitas'),
(72, 28, 1, true,  '2026-09-01 00:00:00', '2026-10-24 23:59:00', 'Concluir o curso preparatório'),
(73, 28, 2, false, '2026-10-25 00:00:00', NULL,                  'Fazer 3 simulados'),
(74, 28, 3, false, '2026-10-25 00:00:00', NULL,                  'Agendar e fazer a prova'),
(75, 29, 1, true,  '2026-10-01 00:00:00', '2026-10-24 23:59:00', 'Criar o repositório no GitHub'),
(76, 29, 2, false, '2026-10-25 00:00:00', NULL,                  'Publicar 3 projetos'),
(77, 29, 3, false, '2026-10-25 00:00:00', NULL,                  'Escrever READMEs detalhados'),
(78, 30, 1, true,  '2026-03-20 00:00:00', '2026-04-23 23:59:00', 'Ler sobre índices'),
(79, 30, 2, true,  '2026-04-24 00:00:00', '2026-05-27 23:59:00', 'Praticar EXPLAIN ANALYZE'),
(80, 30, 3, true,  '2026-05-28 00:00:00', '2026-06-30 23:59:00', 'Otimizar 5 consultas'),
(81, 31, 1, true,  '2026-09-01 00:00:00', '2026-09-27 23:59:00', 'Concluir o módulo 1'),
(82, 31, 2, true,  '2026-09-28 00:00:00', '2026-10-24 23:59:00', 'Concluir o módulo 2'),
(83, 31, 3, false, '2026-10-25 00:00:00', NULL,                  'Concluir o módulo 3'),
(84, 32, 1, true,  '2026-05-05 00:00:00', '2026-07-30 23:59:00', 'Preparar o canteiro'),
(85, 32, 2, true,  '2026-07-31 00:00:00', '2026-10-24 23:59:00', 'Plantar 4 mudas'),
(86, 32, 3, false, '2026-10-25 00:00:00', NULL,                  'Plantar 8 mudas'),
(87, 33, 1, true,  '2026-01-01 00:00:00', '2026-01-30 23:59:00', 'Listar todos os gastos'),
(88, 33, 2, true,  '2026-01-31 00:00:00', '2026-02-28 23:59:00', 'Criar um orçamento mensal'),
(89, 34, 1, true,  '2026-10-15 00:00:00', '2026-10-24 23:59:00', 'Definir os temas'),
(90, 34, 2, false, '2026-10-25 00:00:00', NULL,                  'Escrever 2 artigos'),
(91, 34, 3, false, '2026-10-25 00:00:00', NULL,                  'Publicar os 4 artigos'),
(92, 35, 1, true,  '2026-05-01 00:00:00', '2026-06-11 23:59:00', 'Conduzir 5 sessões'),
(93, 35, 2, true,  '2026-06-12 00:00:00', '2026-07-21 23:59:00', 'Conduzir 10 sessões'),
(94, 35, 3, true,  '2026-07-22 00:00:00', '2026-08-31 23:59:00', 'Conduzir 20 sessões'),
(95, 36, 1, true,  '2026-09-01 00:00:00', '2026-10-24 23:59:00', 'Concluir o módulo teórico'),
(96, 36, 2, false, '2026-10-25 00:00:00', NULL,                  'Cumprir a prática supervisionada'),
(97, 36, 3, false, '2026-10-25 00:00:00', NULL,                  'Fazer a prova final'),
(98, 37, 1, true,  '2026-10-10 00:00:00', '2026-10-24 23:59:00', 'Reservar o sítio'),
(99, 37, 2, false, '2026-10-25 00:00:00', NULL,                  'Montar a programação'),
(100, 37, 3, false,'2026-10-25 00:00:00', NULL,                  'Abrir as inscrições'),
-- Meta 38 (todas submetas concluidas, pronta para clicar "Concluir Meta" + anexar midia)
(101, 38, 1, true, '2026-08-01 00:00:00', '2026-09-01 23:59:00', 'Decorar mão esquerda'),
(102, 38, 2, true, '2026-09-02 00:00:00', '2026-10-01 23:59:00', 'Juntar as duas mãos a 60 BPM'),
-- Meta 39 (concluida com comprovante de imagem)
(103, 39, 1, true, '2026-05-10 00:00:00', '2026-06-15 23:59:00', 'Correr 7 km contínuos'),
(104, 39, 2, true, '2026-06-16 00:00:00', '2026-07-15 23:59:00', 'Completar prova oficial de 10 km'),
-- Meta 40 (concluida com comprovante de video)
(105, 40, 1, true, '2026-06-01 00:00:00', '2026-07-20 23:59:00', 'Estudar compassos 1 a 20'),
(106, 40, 2, true, '2026-07-21 00:00:00', '2026-09-10 23:59:00', 'Gravar execução completa'),
-- Meta 41 (concluida oculta no perfil)
(107, 41, 1, true, '2026-08-01 00:00:00', '2026-09-01 23:59:00', '30 dias sem açúcar refinado');

SELECT setval('usuario_id_seq',    COALESCE((SELECT MAX(id) FROM usuario), 1));
SELECT setval('comunidade_id_seq', COALESCE((SELECT MAX(id) FROM comunidade), 1));
SELECT setval('tag_id_seq',        COALESCE((SELECT MAX(id) FROM tag), 1));
SELECT setval('post_id_seq',       COALESCE((SELECT MAX(id) FROM post), 1));
SELECT setval('evento_id_seq',     COALESCE((SELECT MAX(id) FROM evento), 1));
SELECT setval('comentario_id_seq', COALESCE((SELECT MAX(id) FROM comentario), 1));
SELECT setval('meta_id_seq',       COALESCE((SELECT MAX(id) FROM meta), 1));
SELECT setval('sub_meta_id_seq',   COALESCE((SELECT MAX(id) FROM sub_meta), 1));
