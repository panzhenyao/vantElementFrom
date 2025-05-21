// 性别字典
const sexDict = [
    {
        code: '1',
        name: '男'
    },
    {
        code: '2',
        name: '女'
    }
]

// 还款方式字典
const repaymentDict = [
    {
        code: '1',
        name: '本金和利息按期等额收取'
    },
    {
        code: '2',
        name: '本金按期等额、利息首期收取'
    },
    {
        code: '8',
        name: '本金不定额（银行限定）、利息按期'
    }
]

// 模拟字典请求
export const queryDict = (dictCode) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (dictCode === 'sexDict') {
                resolve({
                    code: 0,
                    data: sexDict
                })
            } else if (dictCode === 'repaymentDict') {
                resolve({
                    code: 0,
                    data: repaymentDict
                })
            } else {
                resolve({
                    code: -1,
                    message: '未找到字典数据',
                    data: []
                })
            }
        }, 400)
    })
}

// 导出所有模拟API函数
export default {
    queryDict
}
