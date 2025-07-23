/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80033
 Source Host           : localhost:3306
 Source Schema         : test

 Target Server Type    : MySQL
 Target Server Version : 80033
 File Encoding         : 65001

 Date: 23/07/2025 10:46:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'devops应用编号',
  `project_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '项目名称',
  `project_desc` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '项目描述',
  `project_member` json NULL COMMENT '项目成员',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_user` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '创建人工号',
  `update_user` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '更新人工号',
  `is_deleted` tinyint NULL DEFAULT 0 COMMENT '删除标识  0未删除  1已删除',
  `app_type` tinyint NULL DEFAULT NULL COMMENT '1-Java服务端（轻舟云部署）、2-Java服务端（单测）、3-安卓单测、4-安卓版本(预留)、5-Java服务端（非轻舟云部署）',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '项目表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of project
-- ----------------------------
INSERT INTO `project` VALUES ('TEST00001', '测试项目1', '测试项目描述', '[36, 31, 32, 33, 34, 35]', '2025-03-03 13:14:48', '2025-07-21 16:40:56', NULL, '230714', 0, 1);
INSERT INTO `project` VALUES ('TEST00002', '测试项目2', '修改', '[31, 32, 33]', '2025-04-15 15:30:45', '2025-07-04 14:14:16', '230714', 'fsl_liuyilan', 0, 5);
INSERT INTO `project` VALUES ('TEST00003', '测试项目3', '测试项目3', '[31, 33, 36]', '2025-04-15 16:28:29', '2025-04-16 15:20:13', '31', 'fsl_liuyilan', 0, NULL);
INSERT INTO `project` VALUES ('TEST00004', '测试项目4', '测试项目4', '[31, 36]', '2025-04-15 16:25:58', '2025-04-15 16:27:36', '31', '31', 1, NULL);
INSERT INTO `project` VALUES ('TEST00005', '测试项目4', '项目4项目4项目4项目4', '[31]', '2025-04-15 16:30:06', '2025-04-15 16:30:33', '31', '31', 1, NULL);
INSERT INTO `project` VALUES ('TEST00006', '测试项目6', 'TEST00006项目6TEST00006项目6TEST00006项目6TEST00006项目6TEST00006项目6', '[31, 45]', '2025-04-15 16:21:15', '2025-06-26 11:19:46', 'fsl_liuyilan', 'fsl_liuyilan', 0, 5);
INSERT INTO `project` VALUES ('TEST00007', '测试项目7', '描述', '[31, 33]', '2025-04-15 17:33:55', '2025-04-15 17:34:15', '230714', '230714', 1, NULL);
INSERT INTO `project` VALUES ('TEST00008', '测试项目8', '2341', '[31, 33]', '2025-04-15 17:58:34', '2025-04-15 17:58:46', '230714', '230714', 1, NULL);
INSERT INTO `project` VALUES ('TEST00011', '测试项目11-111', '测试项目1-111', '[31, 33]', '2025-04-16 09:21:17', '2025-05-28 11:22:10', 'fsl_liuyilan', 'fsl_liuyilan', 1, NULL);
INSERT INTO `project` VALUES ('TEST00012', '测试创建非轻舟云部署项目', '测试创建非轻舟云部署项目', '[33, 36]', '2025-05-28 11:22:57', '2025-05-29 13:12:04', '230714', '230714', 0, 5);
INSERT INTO `project` VALUES ('TEST00013', '安卓测试', '安卓测试', '[31, 32, 33, 36]', '2025-06-25 15:10:54', '2025-06-25 16:15:32', 'fsl_zhushuai', 'fsl_zhushuai', 0, 6);
INSERT INTO `project` VALUES ('TEST05281', '轻舟云项目', '轻舟云项目', '[31, 33]', '2025-05-28 10:49:16', '2025-05-28 10:49:16', 'fsl_liuyilan', 'fsl_liuyilan', 0, 1);
INSERT INTO `project` VALUES ('TEST05282', '非轻舟云项目', '非轻舟云项目', '[31, 33]', '2025-05-28 10:49:55', '2025-05-30 14:57:43', 'fsl_liuyilan', 'fsl_liuyilan', 1, 5);
INSERT INTO `project` VALUES ('TEST05283', '测试非轻舟云', '测试非轻舟云', '[31, 32, 33]', '2025-05-28 10:52:12', '2025-05-30 14:57:41', 'fsl_liuyilan', 'fsl_liuyilan', 1, 5);
INSERT INTO `project` VALUES ('项目新建', '项目新建', '项目新建', '[31]', '2025-05-12 13:48:45', '2025-05-12 13:48:51', 'fsl_liuyilan', 'fsl_liuyilan', 1, NULL);

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '角色名',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_status` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '1' COMMENT '是否有效  1有效  2无效',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '后台角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES (1, '管理员', '2025-04-09 10:39:34', '2025-04-09 10:39:34', '1');
INSERT INTO `sys_role` VALUES (2, '测试主管', '2025-04-09 10:39:34', '2025-04-10 09:57:32', '1');
INSERT INTO `sys_role` VALUES (3, '测试人员', '2025-04-09 10:39:34', '2025-04-10 09:57:35', '1');

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户id',
  `role_id` int NULL DEFAULT NULL COMMENT '角色id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '用户-角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
INSERT INTO `sys_user_role` VALUES (3, 32, 1);
INSERT INTO `sys_user_role` VALUES (5, 34, 2);
INSERT INTO `sys_user_role` VALUES (6, 35, 3);
INSERT INTO `sys_user_role` VALUES (7, 36, 2);
INSERT INTO `sys_user_role` VALUES (8, 37, 2);
INSERT INTO `sys_user_role` VALUES (9, 38, 3);
INSERT INTO `sys_user_role` VALUES (10, 39, 2);
INSERT INTO `sys_user_role` VALUES (11, 40, 3);
INSERT INTO `sys_user_role` VALUES (12, 41, 3);
INSERT INTO `sys_user_role` VALUES (13, 42, 3);
INSERT INTO `sys_user_role` VALUES (14, 43, 3);
INSERT INTO `sys_user_role` VALUES (15, 33, 2);
INSERT INTO `sys_user_role` VALUES (17, 31, 1);
INSERT INTO `sys_user_role` VALUES (18, 44, 3);
INSERT INTO `sys_user_role` VALUES (19, 45, 3);
INSERT INTO `sys_user_role` VALUES (20, 46, 3);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识',
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '密码',
  `nickname` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `empno` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '工号',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_user` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '创建人工号',
  `update_user` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '更新人工号',
  `is_deleted` tinyint NULL DEFAULT 0 COMMENT '删除标识  0未删除  1已删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 47 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (31, 'fsl_liuyilan', NULL, '刘怡兰', NULL, '2025-03-13 13:02:15', '2025-06-25 10:54:39', NULL, NULL, 0);
INSERT INTO `user` VALUES (32, '230674', NULL, '王越冬', NULL, '2025-03-13 13:57:54', '2025-03-13 13:57:54', NULL, NULL, 0);
INSERT INTO `user` VALUES (33, '230714', NULL, '余璐丹', NULL, '2025-03-14 10:59:40', '2025-04-15 14:02:49', NULL, NULL, 0);
INSERT INTO `user` VALUES (34, '230429', NULL, '李跃', NULL, '2025-03-19 09:58:03', '2025-03-19 09:58:03', NULL, NULL, 0);
INSERT INTO `user` VALUES (35, 'zrgj_yuanmingjie', NULL, '原明杰', NULL, '2025-03-26 10:46:27', '2025-03-26 10:46:27', NULL, NULL, 0);
INSERT INTO `user` VALUES (36, 'fsl_zhushuai', NULL, '朱帅', NULL, '2025-04-10 09:58:46', '2025-04-10 09:58:46', NULL, NULL, 0);
INSERT INTO `user` VALUES (37, 'zs_04073', NULL, '窦娜娜', NULL, '2025-04-10 16:37:42', '2025-04-10 16:37:42', NULL, NULL, 0);
INSERT INTO `user` VALUES (38, 'fb_wangyan', NULL, '王燕', NULL, '2025-04-10 16:46:54', '2025-04-10 16:46:54', NULL, NULL, 0);
INSERT INTO `user` VALUES (39, '200881', NULL, '卞凤杰', NULL, '2025-04-10 16:48:03', '2025-04-10 16:48:03', NULL, NULL, 0);
INSERT INTO `user` VALUES (40, 'swfw04016', NULL, '王现宁', NULL, '2025-04-10 16:48:18', '2025-04-10 16:48:18', NULL, NULL, 0);
INSERT INTO `user` VALUES (41, 'lizhenke', NULL, '李贞科', NULL, '2025-04-11 13:33:47', '2025-04-11 13:33:47', NULL, NULL, 0);
INSERT INTO `user` VALUES (42, '230605', NULL, '尹飞', NULL, '2025-04-11 13:36:28', '2025-04-11 13:36:28', NULL, NULL, 0);
INSERT INTO `user` VALUES (43, '200979', NULL, '胡睿', NULL, '2025-04-11 13:40:05', '2025-04-11 13:40:05', NULL, NULL, 0);
INSERT INTO `user` VALUES (44, '230588', NULL, '张亚飞', NULL, '2025-06-20 09:35:59', '2025-06-20 09:35:59', NULL, NULL, 0);
INSERT INTO `user` VALUES (45, 'zkr_wangyao', NULL, '王耀', NULL, '2025-06-20 10:21:49', '2025-06-20 10:21:49', NULL, NULL, 0);
INSERT INTO `user` VALUES (46, 'zkr_liuyongchao', NULL, '刘永超', NULL, '2025-06-20 15:06:16', '2025-06-20 15:06:16', NULL, NULL, 0);

SET FOREIGN_KEY_CHECKS = 1;
