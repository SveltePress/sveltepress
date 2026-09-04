/**
 * lint-staged runs this suite during `git commit` with GIT_INDEX_FILE /
 * GIT_DIR pointing at the parent repo. Nested `git add` must not inherit them.
 */
delete process.env.GIT_DIR
delete process.env.GIT_WORK_TREE
delete process.env.GIT_INDEX_FILE
delete process.env.GIT_OBJECT_DIRECTORY
delete process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES
delete process.env.GIT_PREFIX
delete process.env.GIT_COMMON_DIR
