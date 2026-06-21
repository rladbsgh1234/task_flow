import React, { useState, useEffect } from 'react';

// 고려대 캠퍼스 주요 거점
const CAMPUS_SPOTS = [
  '중앙도서관 앞', 
  '학생회관 앞', 
  '정문 정류장', 
  '민주광장', 
  '백주년기념관 로비', 
  '신공학관 로비', 
  '하나스퀘어 지하', 
  '서관(문과대) 시계탑 앞', 
  '애기능 광장'
];

// 대학 및 학과 구조
const COLLEGE_DEPARTMENTS = {
  '문과대학': ['사학과', '철학과', '국어국문학과', '영어영문학과', '심리학과', '사회학과'],
  '공과대학': ['기계공학부', '신소재공학부', '화학생명공학부', '건축학과', '산업경영공학부'],
  '정경대학': ['경제학과', '정치외교학과', '통계학과', '행정학과'],
  '경영대학': ['경영학과'],
  '정보대학': ['컴퓨터학과', '데이터과학과'],
  '사범대학': ['역사교육과', '국어교육과', '영어교육과', '수학교육과', '컴퓨터교육과'],
  '생명과학대학': ['생명과학부', '생명공학부', '식품공학부']
};

// mock ISBN 데이터
const MOCK_ISBN_DB = {
  '9791162245644': {
    title: '고려시대 사학사 연구',
    author: '김경현',
    publisher: '고려대학교출판문화원',
    originalPrice: 28000,
    college: '문과대학',
    department: '사학과',
    description: '고려시대 역사 서술과 역사 인식의 흐름을 심층 연구한 사학 전공 전문 서적입니다.'
  },
  '9791130312345': {
    title: '서양 문명의 역사 I',
    author: '에드워드 맥널 번즈',
    publisher: '소나무',
    originalPrice: 32000,
    college: '문과대학',
    department: '사학과',
    description: '서양사 전공 필수 도서로, 서양 문명의 시작부터 중세 말기까지를 포괄적으로 서술합니다.'
  },
  '9788930089852': {
    title: '알고리즘 개론 (Introduction to Algorithms)',
    author: 'Thomas H. Cormen',
    publisher: '한빛아카데미',
    originalPrice: 45000,
    college: '정보대학',
    department: '컴퓨터학과',
    description: '컴퓨터전공의 바이블! 정렬, 검색, 그래프, 동적 계획법 등 기본 알고리즘 이론 수록.'
  }
};

export default function BookRegistration({ onRegisterSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  
  const [college, setCollege] = useState('문과대학');
  const [department, setDepartment] = useState('사학과');
  const [condition, setCondition] = useState('good'); // 'best', 'good', 'fair', 'poor'
  const [hasWriting, setHasWriting] = useState(false);
  const [hasDamage, setHasDamage] = useState(false);
  
  const [meetupLocation, setMeetupLocation] = useState('중앙도서관 앞');
  const [description, setDescription] = useState('');

  // 이미지 업로드 상태
  const [images, setImages] = useState([]);
  const [priceWarning, setPriceWarning] = useState('');

  // 바코드/ISBN 스캔 시뮬레이션용 입력
  const [isbnQuery, setIsbnQuery] = useState('');

  // 단과대 선택 변경 시 학과 목록 첫번째로 강제 변경
  useEffect(() => {
    if (COLLEGE_DEPARTMENTS[college]) {
      setDepartment(COLLEGE_DEPARTMENTS[college][0]);
    }
  }, [college]);

  // 70% 가격 상한 검사
  useEffect(() => {
    if (isFree) {
      setPriceWarning('');
      return;
    }

    if (condition === 'best' && originalPrice && price) {
      const numOriginal = parseInt(originalPrice.toString().replace(/,/g, ''), 10);
      const numPrice = parseInt(price.toString().replace(/,/g, ''), 10);
      const limit = numOriginal * 0.7;

      if (numPrice > limit) {
        setPriceWarning(`⚠️ 도서 상태가 '최상'인 경우, 정가의 70%(${Math.floor(limit).toLocaleString('ko-KR')}원) 이하로만 판매가를 등록할 수 있습니다.`);
      } else {
        setPriceWarning('');
      }
    } else {
      setPriceWarning('');
    }
  }, [condition, originalPrice, price, isFree]);

  // ISBN 모의 검색 기능
  const handleIsbnMockSearch = () => {
    const found = MOCK_ISBN_DB[isbnQuery.trim()];
    if (found) {
      setTitle(found.title);
      setAuthor(found.author);
      setPublisher(found.publisher);
      setOriginalPrice(found.originalPrice.toLocaleString());
      setCollege(found.college);
      setTimeout(() => {
        setDepartment(found.department);
      }, 50);
      setDescription(found.description);
      alert(`🔎 ISBN 연동 성공!\n[${found.title}] 도서 정보가 자동으로 로딩되었습니다.`);
    } else {
      alert('일치하는 모의 ISBN 데이터가 없습니다.\n예시: 9791162245644, 9788930089852');
    }
  };

  // 콤마 제거 숫자 포맷팅
  const handlePriceInputChange = (val, setter) => {
    const numeric = val.replace(/[^0-9]/g, '');
    setter(numeric ? Number(numeric).toLocaleString('ko-KR') : '');
  };

  const handleFreeToggle = () => {
    const updatedFree = !isFree;
    setIsFree(updatedFree);
    if (updatedFree) {
      setPrice('0');
    } else {
      setPrice('');
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      if (images.length >= 3) {
        alert('사진은 최대 3장까지만 업로드 가능합니다.');
        return;
      }
      setImages([...images, objectUrl]);
    }
  };

  const removeUploadedImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return alert('도서 제목을 입력해주세요.');
    if (!author) return alert('저자를 입력해주세요.');
    if (!originalPrice) return alert('정가를 입력해주세요.');
    if (!isFree && !price) return alert('판매 가격을 입력해주세요.');

    const numOriginal = parseInt(originalPrice.toString().replace(/,/g, ''), 10);
    const numPrice = isFree ? 0 : parseInt(price.toString().replace(/,/g, ''), 10);

    if (!isFree && condition === 'best' && numPrice > (numOriginal * 0.7)) {
      alert(`등록 불가: 최상 등급 서적은 정가의 70%(${Math.floor(numOriginal*0.7).toLocaleString()}원)를 초과하여 판매할 수 없습니다.`);
      return;
    }

    const registeredData = {
      title,
      author,
      publisher: publisher || '출판사 없음',
      originalPrice: numOriginal,
      price: numPrice,
      isFree,
      college,
      department,
      condition,
      hasWriting,
      hasDamage,
      meetupLocation,
      description: description || '',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400']
    };

    if (onRegisterSuccess) {
      onRegisterSuccess(registeredData);
    } else {
      alert('도서 등록이 완료되었습니다!');
      console.log(registeredData);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-5 space-y-6">
      <h2 className="text-lg font-extrabold text-slate-800 border-b pb-2">📚 도서 등록하기</h2>
      
      {/* ISBN SEARCH (BARCODE) */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-2">
        <label className="text-xs font-bold text-slate-700 block">⚡ ISBN 연동 등록 (바코드 번호 입력)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isbnQuery}
            onChange={e => setIsbnQuery(e.target.value)}
            placeholder="ISBN 13자리 입력"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-250 bg-white text-xs font-bold tracking-wider outline-none focus:border-ku-crimson"
          />
          <button
            type="button"
            onClick={handleIsbnMockSearch}
            className="px-3 py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs active:scale-95 transition-all shrink-0"
          >
            조회
          </button>
        </div>
        <p className="text-[10px] text-slate-400">테스트용 번호: 9791162245644 (고려시대 사학사 연구)</p>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-slate-800">도서 사진 등록 ({images.length}/3)</label>
        </div>
        <div className="flex gap-2.5 overflow-x-auto py-1">
          {images.length < 3 && (
            <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-rose-100 hover:border-red-500 bg-rose-50/10 flex flex-col items-center justify-center cursor-pointer transition-all shrink-0">
              <span className="text-lg">📷</span>
              <span className="text-[9px] font-bold text-red-700 mt-0.5">사진 추가</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          {images.map((imgSrc, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
              <img src={imgSrc} alt="preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => removeUploadedImage(idx)} 
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/60 text-white flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INPUT FIELDS */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 pl-1">도서 제목 *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="책 제목을 입력하세요"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 pl-1">저자 *</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="저자 이름"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 pl-1">출판사</label>
            <input
              type="text"
              value={publisher}
              onChange={e => setPublisher(e.target.value)}
              placeholder="출판사 이름"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 pl-1">단과대 *</label>
            <select
              value={college}
              onChange={e => setCollege(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-none focus:border-red-500"
            >
              {Object.keys(COLLEGE_DEPARTMENTS).map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 pl-1">학과 *</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-none focus:border-red-500"
            >
              {COLLEGE_DEPARTMENTS[college] && COLLEGE_DEPARTMENTS[college].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PRICING */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 pl-1">도서 정가 (소비자가) *</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-sm font-bold">₩</span>
              <input
                type="text"
                value={originalPrice}
                onChange={e => handlePriceInputChange(e.target.value, setOriginalPrice)}
                placeholder="도서 정가 입력"
                className="w-full pl-9 pr-8 py-3 rounded-2xl border border-slate-200 focus:border-red-500 outline-none text-sm font-bold bg-white"
              />
              <span className="absolute right-4 text-xs font-bold text-slate-400">원</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-700">판매 희망가 *</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[10px] font-bold text-slate-500">무료 나눔</span>
                <input type="checkbox" checked={isFree} onChange={handleFreeToggle} className="rounded text-red-700" />
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-sm font-bold">₩</span>
              <input
                type="text"
                disabled={isFree}
                value={price}
                onChange={e => handlePriceInputChange(e.target.value, setPrice)}
                placeholder={isFree ? '무료' : '판매가 입력'}
                className="w-full pl-9 pr-8 py-3 rounded-2xl border border-slate-200 focus:border-red-500 outline-none text-sm font-bold disabled:bg-slate-50"
              />
              <span className="absolute right-4 text-xs font-bold text-slate-400">원</span>
            </div>
            {priceWarning && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{priceWarning}</p>}
          </div>
        </div>

        {/* CONDITION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 pl-1">도서 상태 등급 *</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'best', label: '최상', desc: '새책 수준' },
              { key: 'good', label: '상', desc: '흔적 적음' },
              { key: 'fair', label: '중', desc: '필기 있음' },
              { key: 'poor', label: '하', desc: '훼손 많음' }
            ].map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCondition(item.key)}
                className={`py-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  condition === item.key
                    ? 'border-red-700 bg-rose-50/50 text-red-800 font-bold'
                    : 'border-slate-200 text-slate-500 bg-white font-medium hover:border-slate-300'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                <span className="text-[9px] text-slate-400">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ADDITIONAL CHECKS */}
        <div className="flex gap-4 px-1 py-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-650 cursor-pointer">
            <input type="checkbox" checked={hasWriting} onChange={e => setHasWriting(e.target.checked)} className="rounded text-red-700" />
            <span>필기 흔적 있음</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-650 cursor-pointer">
            <input type="checkbox" checked={hasDamage} onChange={e => setHasDamage(e.target.checked)} className="rounded text-red-700" />
            <span>도서 훼손 있음</span>
          </label>
        </div>

        {/* MEETUP LOCATION */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 pl-1">📍 희망 거래 장소 *</label>
          <select
            value={meetupLocation}
            onChange={e => setMeetupLocation(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-none focus:border-red-500"
          >
            {CAMPUS_SPOTS.map(spot => (
              <option key={spot} value={spot}>{spot}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 pl-1">도서 상세 설명</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="책 상세 상태 설명"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-500 outline-none text-sm font-medium resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-red-700 text-white font-extrabold rounded-2xl shadow-lg hover:bg-red-800 active:scale-95 transition-all"
        >
          등록 완료
        </button>
      </form>
    </div>
  );
}
