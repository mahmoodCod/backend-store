const createPaginationData = (page, limit, totalCount, resourseName) => ({
    page,
    limit,
    totalPage: Math.ceil(totalCount / limit),
    ['total' + resourseName]: totalCount,
});

module.exports = {createPaginationData};