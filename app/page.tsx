'use client'

import { useState } from 'react'

interface Product {
  PRD_ID: number | null
  CODE: string | null
  NAME: string | null
  PRICE: number | null
}

interface PurchaseItem {
  PRD_ID: number
  PRD_CODE: string
  PRD_NAME: string
  PRD_PRICE: number
  quantity: number
}

export default function POSSystem() {
  const [productCode, setProductCode] = useState('')
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [purchaseList, setPurchaseList] = useState<PurchaseItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // 商品コード読み込み
  const handleLoadProduct = async () => {
    if (!productCode) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/product/${productCode}`)
      const data = await response.json()

      if (data.PRD_ID === null) {
        // 商品が見つからない場合
        setCurrentProduct({
          PRD_ID: null,
          CODE: null,
          NAME: '商品がマスタ未登録です',
          PRICE: null,
        })
      } else {
        setCurrentProduct(data)
      }
    } catch (error) {
      console.error('商品検索エラー:', error)
      alert('商品の検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 購入リストへ追加
  const handleAddToList = () => {
    if (!currentProduct || currentProduct.PRD_ID === null) {
      alert('有効な商品を選択してください')
      return
    }

    // 既存の商品があれば数量を増やす
    const existingIndex = purchaseList.findIndex(
      (item) => item.PRD_ID === currentProduct.PRD_ID
    )

    if (existingIndex >= 0) {
      const newList = [...purchaseList]
      newList[existingIndex].quantity += 1
      setPurchaseList(newList)
    } else {
      setPurchaseList([
        ...purchaseList,
        {
          PRD_ID: currentProduct.PRD_ID!,
          PRD_CODE: currentProduct.CODE!,
          PRD_NAME: currentProduct.NAME!,
          PRD_PRICE: currentProduct.PRICE!,
          quantity: 1,
        },
      ])
    }

    // 入力欄をクリア
    setProductCode('')
    setCurrentProduct(null)
  }

  // 購入処理
  const handlePurchase = async () => {
    if (purchaseList.length === 0) {
      alert('購入する商品がありません')
      return
    }

    setIsLoading(true)
    try {
      // 購入リストを展開（数量分のアイテムを個別に送信）
      const items = purchaseList.flatMap((item) =>
        Array(item.quantity).fill({
          PRD_ID: item.PRD_ID,
          PRD_CODE: item.PRD_CODE,
          PRD_NAME: item.PRD_NAME,
          PRD_PRICE: item.PRD_PRICE,
        })
      )

      const response = await fetch(`${API_URL}/api/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EMP_CD: '9999999999',
          STORE_CD: '30',
          POS_NO: '90',
          items,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 消費税込みの金額を計算（10%）
        const totalWithTax = Math.floor(data.total_amount * 1.1)
        alert(`購入が完了しました\n合計金額（税込）: ¥${totalWithTax.toLocaleString()}`)

        // リストをクリア
        setPurchaseList([])
        setProductCode('')
        setCurrentProduct(null)
      } else {
        alert('購入処理に失敗しました')
      }
    } catch (error) {
      console.error('購入エラー:', error)
      alert('購入処理に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // Enterキーで読み込み
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadProduct()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          POSアプリケーション
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 商品入力エリア */}
          <div className="space-y-6">
            {/* ②コード入力エリア */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品コード
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345678901"
                disabled={isLoading}
              />
            </div>

            {/* ①読み込みボタン */}
            <button
              onClick={handleLoadProduct}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:bg-gray-400"
            >
              商品コード読み込み
            </button>

            {/* ③名称表示エリア */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品名称
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
                {currentProduct?.NAME || ''}
              </div>
            </div>

            {/* ④単価表示エリア */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品単価
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
                {currentProduct?.PRICE !== null && currentProduct?.PRICE !== undefined
                  ? `${currentProduct.PRICE}円`
                  : ''}
              </div>
            </div>

            {/* ⑤追加ボタン */}
            <button
              onClick={handleAddToList}
              disabled={!currentProduct || currentProduct.PRD_ID === null || isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:bg-gray-400"
            >
              追加
            </button>
          </div>

          {/* 右側: 購入リスト */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">購入リスト</h2>

            {/* ⑥購入品目リスト */}
            <div className="border border-gray-300 rounded-md p-4 min-h-[400px] bg-gray-50">
              {purchaseList.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  商品が追加されていません
                </p>
              ) : (
                <div className="space-y-2">
                  {purchaseList.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{item.PRD_NAME}</span>
                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600">{item.PRD_PRICE}円</div>
                        <div className="font-bold">
                          {(item.PRD_PRICE * item.quantity).toLocaleString()}円
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 合計金額表示 */}
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>小計:</span>
                <span>
                  ¥
                  {purchaseList
                    .reduce((sum, item) => sum + item.PRD_PRICE * item.quantity, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                <span>税込合計（10%）:</span>
                <span>
                  ¥
                  {Math.floor(
                    purchaseList.reduce(
                      (sum, item) => sum + item.PRD_PRICE * item.quantity,
                      0
                    ) * 1.1
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* ⑦購入ボタン */}
            <button
              onClick={handlePurchase}
              disabled={purchaseList.length === 0 || isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-md text-lg transition-colors disabled:bg-gray-400"
            >
              購入
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}