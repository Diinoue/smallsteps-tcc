-- =====================================================================
-- INSERTs de exemplo (PostgreSQL) - schema public
-- Ordem: usuario, comunidade, tag, tag_usuario, tag_comunidade,
--        participam, solicitam, post, evento, comentario, meta, sub_meta
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- USUARIO
-- ---------------------------------------------------------------------
INSERT INTO usuario (id, streak_num, intervalo_atividade, ultima_atividade, ultimo_prazo, descricao, email, nome) VALUES
(1,  12, INTERVAL '1 day', '2026-10-21 08:15:00', '2026-10-25 23:59:00', 'Apaixonada por corrida e café.',          'ana.souza@email.com',        'Ana Souza'),
(2,   5, INTERVAL '1 day', '2026-10-21 19:40:00', '2026-10-24 23:59:00', 'Organizo treinos nos fins de semana.',    'bruno.lima@email.com',       'Bruno Lima'),
(3,  30, INTERVAL '1 day', '2026-10-22 07:05:00', '2026-10-30 23:59:00', 'Leio um livro por semana.',               'carla.mendes@email.com',     'Carla Mendes'),
(4,   0, INTERVAL '2 days','2026-10-18 21:00:00', NULL,                  'Desenvolvedor backend em transição.',    'diego.ferreira@email.com',   'Diego Ferreira'),
(5,   8, INTERVAL '1 day', '2026-10-21 06:30:00', '2026-10-28 23:59:00', 'Meditação todas as manhãs.',              'elisa.rocha@email.com',      'Elisa Rocha'),
(6,   3, INTERVAL '1 day', '2026-10-20 18:20:00', '2026-10-23 23:59:00', NULL,                                      'felipe.alves@email.com',     'Felipe Alves'),
(7,  21, INTERVAL '1 day', '2026-10-22 09:10:00', '2026-11-02 23:59:00', 'Cultivo temperos na varanda.',            'gabriela.costa@email.com',   'Gabriela Costa'),
(8,   1, INTERVAL '3 days','2026-10-19 14:00:00', NULL,                  'Estudando para certificações.',          'henrique.duarte@email.com',  'Henrique Duarte'),
(9,  15, INTERVAL '1 day', '2026-10-21 22:45:00', '2026-10-27 23:59:00', 'Gosto de tecnologia e jardinagem.',       'isabela.martins@email.com',  'Isabela Martins'),
(10,  7, INTERVAL '1 day', '2026-10-22 05:50:00', '2026-10-26 23:59:00', 'Instrutor de yoga.',                      'joao.pereira@email.com',     'João Pereira');

-- ---------------------------------------------------------------------
-- COMUNIDADE
-- ---------------------------------------------------------------------
INSERT INTO comunidade (id, privado, dt_criacao, foto, nome) VALUES
(1, false, '2026-01-10 10:00:00', 'corredores.jpg',  'Corredores de Fim de Semana'),
(2, true,  '2026-02-15 14:30:00', 'livros.jpg',      'Clube do Livro'),
(3, false, '2026-03-05 09:00:00', NULL,              'Devs em Estudo'),
(4, false, '2026-04-20 16:45:00', 'horta.jpg',       'Hortas Urbanas'),
(5, true,  '2026-05-01 07:00:00', 'meditacao.jpg',   'Meditação Diária');

-- ---------------------------------------------------------------------
-- TAG
-- ---------------------------------------------------------------------
INSERT INTO tag (id, descricao) VALUES
(1, 'Saúde'),
(2, 'Leitura'),
(3, 'Programação'),
(4, 'Esportes'),
(5, 'Meditação'),
(6, 'Sustentabilidade'),
(7, 'Produtividade'),
(8, 'Música');

-- ---------------------------------------------------------------------
-- TAG_USUARIO (id_tag, id_usuario)
-- ---------------------------------------------------------------------
INSERT INTO tag_usuario (id_tag, id_usuario) VALUES
(4, 1), (1, 1),
(4, 2),
(2, 3), (7, 3),
(3, 4),
(5, 5), (1, 5),
(4, 6),
(6, 7),
(3, 8), (7, 8),
(3, 9), (6, 9),
(5, 10), (1, 10);

-- ---------------------------------------------------------------------
-- TAG_COMUNIDADE (id_comunidade, id_tag)
-- ---------------------------------------------------------------------
INSERT INTO tag_comunidade (id_comunidade, id_tag) VALUES
(1, 4), (1, 1),
(2, 2),
(3, 3), (3, 7),
(4, 6),
(5, 5), (5, 1);

-- ---------------------------------------------------------------------
-- PARTICIPAM (id_comunidade, id_usuario, pontos, dt_inicio, cargo)
-- cargo: MEMBRO | ADMINISTRADOR | DONO
-- ---------------------------------------------------------------------
INSERT INTO participam (id_comunidade, id_usuario, pontos, dt_inicio, cargo) VALUES
-- Corredores de Fim de Semana
(1, 1,  320, '2026-01-10 10:00:00', 'DONO'),
(1, 2,  210, '2026-01-12 11:20:00', 'ADMINISTRADOR'),
(1, 3,   90, '2026-01-20 08:00:00', 'MEMBRO'),
(1, 4,   40, '2026-02-01 18:30:00', 'MEMBRO'),
(1, 5,  130, '2026-02-10 07:15:00', 'MEMBRO'),
-- Clube do Livro
(2, 3,  450, '2026-02-15 14:30:00', 'DONO'),
(2, 5,  180, '2026-02-16 09:00:00', 'ADMINISTRADOR'),
(2, 6,   60, '2026-03-01 20:00:00', 'MEMBRO'),
(2, 7,   75, '2026-03-10 21:10:00', 'MEMBRO'),
-- Devs em Estudo
(3, 4,  500, '2026-03-05 09:00:00', 'DONO'),
(3, 8,  260, '2026-03-06 10:30:00', 'ADMINISTRADOR'),
(3, 1,   80, '2026-03-15 19:00:00', 'MEMBRO'),
(3, 2,   55, '2026-03-18 20:15:00', 'MEMBRO'),
(3, 9,  190, '2026-03-20 08:45:00', 'MEMBRO'),
(3, 10,  30, '2026-04-02 12:00:00', 'MEMBRO'),
-- Hortas Urbanas
(4, 7,  380, '2026-04-20 16:45:00', 'DONO'),
(4, 6,   45, '2026-05-02 10:00:00', 'MEMBRO'),
(4, 9,  150, '2026-05-05 17:30:00', 'MEMBRO'),
-- Meditação Diária
(5, 10, 410, '2026-05-01 07:00:00', 'DONO'),
(5, 1,  170, '2026-05-02 06:45:00', 'ADMINISTRADOR'),
(5, 5,  220, '2026-05-03 06:30:00', 'MEMBRO');

-- ---------------------------------------------------------------------
-- SOLICITAM (id_comunidade, id_usuario, dt_inicio)
-- Pedidos pendentes de entrada (normalmente em comunidades privadas)
-- ---------------------------------------------------------------------
INSERT INTO solicitam (id_comunidade, id_usuario, dt_inicio) VALUES
(2, 4,  '2026-10-15 12:00:00'),
(2, 8,  '2026-10-18 09:30:00'),
(5, 3,  '2026-10-19 07:10:00'),
(5, 9,  '2026-10-20 22:00:00');

-- ---------------------------------------------------------------------
-- POST
-- ---------------------------------------------------------------------
INSERT INTO post (id, id_comunidade, id_usuario, dt_criacao, descricao) VALUES
(1, 1, 1, '2026-10-10 08:00:00', 'Bom dia, pessoal! Quem topa uma corrida de 5 km no domingo?'),
(2, 1, 2, '2026-10-11 19:30:00', 'Dica: alongar por 10 minutos depois do treino reduz muito a dor muscular.'),
(3, 2, 3, '2026-10-12 20:00:00', 'O livro do mês será "Dom Casmurro". Vamos discutir no dia 30!'),
(4, 3, 4, '2026-10-13 09:15:00', 'Alguém tem recomendação de curso de PostgreSQL para quem está começando?'),
(5, 3, 9, '2026-10-14 21:40:00', 'Compartilhando um resumo sobre índices e performance de consultas.'),
(6, 4, 7, '2026-10-15 07:45:00', 'Minhas mudas de manjericão finalmente brotaram!'),
(7, 5, 10,'2026-10-16 06:00:00', 'Sessão guiada de respiração de 10 minutos hoje às 6h30.'),
(8, 5, 5, '2026-10-17 06:50:00', 'Consegui meditar 21 dias seguidos. Obrigada pelo apoio, grupo!');

-- ---------------------------------------------------------------------
-- EVENTO
-- ---------------------------------------------------------------------
INSERT INTO evento (id, id_comunidade, id_usuario, dia_inicio, dia_fim, horario_inicio, horario_fim, titulo, local, descricao) VALUES
(1, 1, 1,  '2026-10-25', '2026-10-25', '07:00', '09:00', 'Corrida no Parque',         'Parque Ibirapuera, portão 3',   'Corrida leve de 5 km seguida de café coletivo.'),
(2, 2, 3,  '2026-10-30', '2026-10-30', '19:30', '21:30', 'Debate: Dom Casmurro',       'Biblioteca Central, sala 2',    'Discussão do livro do mês com lanche.'),
(3, 3, 4,  '2026-11-07', '2026-11-08', '09:00', '17:00', 'Hackathon de Banco de Dados','Online (Meet)',                 'Maratona de modelagem e otimização de consultas.'),
(4, 4, 7,  '2026-11-01', '2026-11-01', '10:00', '12:30', 'Oficina de Compostagem',     'Horta Comunitária da Vila',     'Aprenda a montar sua composteira caseira.'),
(5, 5, 10, '2026-11-14', '2026-11-14', '06:00', '08:00', 'Retiro de Meditação',        'Sítio Recanto Verde',           'Manhã de práticas guiadas e silêncio.');

-- ---------------------------------------------------------------------
-- COMENTARIO (id_evento OU id_post preenchido; o outro fica NULL)
-- ---------------------------------------------------------------------
INSERT INTO comentario (id, id_evento, id_post, id_usuario, dt_criacao, conteudo) VALUES
(1, NULL, 1, 2,  '2026-10-10 08:30:00', 'Eu topo! Levo água para todo mundo.'),
(2, NULL, 1, 5,  '2026-10-10 09:10:00', 'Também vou, preciso testar o tênis novo.'),
(3, NULL, 4, 8,  '2026-10-13 10:00:00', 'Recomendo a documentação oficial, é muito boa.'),
(4, NULL, 6, 9,  '2026-10-15 12:20:00', 'Que lindo! Quando crescer me passa uma muda?'),
(5, 1,    NULL, 3, '2026-10-20 18:00:00', 'Confirmado! Chego às 6h50.'),
(6, 2,    NULL, 7, '2026-10-21 20:15:00', 'Vou levar um bolo para o lanche.'),
(7, 3,    NULL, 1, '2026-10-21 21:00:00', 'Posso participar mesmo sendo iniciante?'),
(8, 5,    NULL, 1, '2026-10-22 06:40:00', 'Já reservei minha vaga, mal posso esperar.');

-- ---------------------------------------------------------------------
-- META
-- ---------------------------------------------------------------------
INSERT INTO meta (id, id_usuario, concluido, visivel, dt_inicio, dt_fim, titulo) VALUES
(1, 1, false, true,  '2026-09-01 00:00:00', '2026-12-31 23:59:00', 'Correr uma meia maratona'),
(2, 3, false, true,  '2026-01-01 00:00:00', '2026-12-31 23:59:00', 'Ler 52 livros em 2026'),
(3, 4, false, false, '2026-10-01 00:00:00', NULL,                  'Aprender PostgreSQL avançado'),
(4, 5, true,  true,  '2026-09-01 00:00:00', '2026-09-30 23:59:00', 'Meditar 30 dias seguidos'),
(5, 7, false, true,  '2026-04-20 00:00:00', '2026-11-30 23:59:00', 'Montar horta com 10 espécies');

-- ---------------------------------------------------------------------
-- SUB_META
-- ---------------------------------------------------------------------
INSERT INTO sub_meta (id, id_meta, pos, concluido, dt_inicio, dt_fim, titulo) VALUES
(1,  1, 1, true,  '2026-09-01 00:00:00', '2026-09-30 23:59:00', 'Correr 5 km sem parar'),
(2,  1, 2, true,  '2026-10-01 00:00:00', '2026-10-15 23:59:00', 'Correr 10 km'),
(3,  1, 3, false, '2026-10-16 00:00:00', NULL,                  'Correr 15 km'),
(4,  2, 1, true,  '2026-01-01 00:00:00', '2026-06-30 23:59:00', 'Ler 26 livros até junho'),
(5,  2, 2, false, '2026-07-01 00:00:00', NULL,                  'Ler 26 livros no segundo semestre'),
(6,  3, 1, true,  '2026-10-01 00:00:00', '2026-10-10 23:59:00', 'Estudar índices B-tree'),
(7,  3, 2, false, '2026-10-11 00:00:00', NULL,                  'Estudar EXPLAIN ANALYZE'),
(8,  4, 1, true,  '2026-09-01 00:00:00', '2026-09-30 23:59:00', 'Meditar 10 minutos por dia'),
(9,  5, 1, true,  '2026-04-20 00:00:00', '2026-05-10 23:59:00', 'Preparar os vasos e o substrato'),
(10, 5, 2, false, '2026-05-11 00:00:00', NULL,                  'Plantar 10 espécies diferentes');

-- ---------------------------------------------------------------------
-- (OPCIONAL) USERS - tabela aparentemente legada, com colunas diferentes
-- As senhas abaixo são apenas textos fictícios, NÃO são hashes reais.
-- streak_status só aceita 0, 1 ou 2.
-- ---------------------------------------------------------------------
INSERT INTO users (id, streak_num, streak_status, ultima_atividade, descricao, email, nome, senha) VALUES
(1, 4, 1, '2026-10-21 08:00:00', 'Usuário de teste 1', 'teste1@email.com', 'Teste Um',   'senha_fake_1'),
(2, 0, 0, NULL,                  'Usuário de teste 2', 'teste2@email.com', 'Teste Dois', 'senha_fake_2'),
(3, 9, 2, '2026-10-22 07:30:00', 'Usuário de teste 3', 'teste3@email.com', 'Teste Três', 'senha_fake_3');

-- ---------------------------------------------------------------------
-- Ajusta as sequences, já que os IDs foram inseridos manualmente
-- ---------------------------------------------------------------------
SELECT setval('usuario_id_seq',    (SELECT MAX(id) FROM usuario));
SELECT setval('comunidade_id_seq', (SELECT MAX(id) FROM comunidade));
SELECT setval('tag_id_seq',        (SELECT MAX(id) FROM tag));
SELECT setval('post_id_seq',       (SELECT MAX(id) FROM post));
SELECT setval('evento_id_seq',     (SELECT MAX(id) FROM evento));
SELECT setval('comentario_id_seq', (SELECT MAX(id) FROM comentario));
SELECT setval('meta_id_seq',       (SELECT MAX(id) FROM meta));
SELECT setval('sub_meta_id_seq',   (SELECT MAX(id) FROM sub_meta));

COMMIT;