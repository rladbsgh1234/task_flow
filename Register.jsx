import React, { useState, useEffect, useRef } from 'react';

export default function Register({ onRegisterSuccess }) {
  // 1. Email ID & Duplicate Check States
  const [email, setEmail] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false); // 중복확인 여부
  const [emailError, setEmailError] = useState('');
  
  // 2. Password States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState({ message: '', isValid: false });

  // 3. School Webmail States
  const [schoolEmail, setSchoolEmail] = useState('');
  const [isMailSent, setIsMailSent] = useState(false);
  const [sentCode, setSentCode] = useState(''); // 서버에서 발송된 목업 인증코드
  const [userCode, setUserCode] = useState(''); // 사용자가 입력한 인증코드
  const [isMailVerified, setIsMailVerified] = useState(false); // 메일인증 여부
  const [schoolEmailError, setSchoolEmailError] = useState('');

  // 4. Timer States
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);

  // 이메일 정규식 검사
  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!value) {
      setEmailError('이메일 주소를 입력해주세요.');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    setEmailError('');
    return true;
  };

  // 아이디 중복 확인 시뮬레이션
  const handleDuplicateCheck = () => {
    if (!validateEmail(email)) return;
    
    // 시뮬레이션: 특정 이메일들은 중복으로 처리
    if (email === 'test@test.com' || email === 'admin@korea.ac.kr') {
      setEmailError('이미 가입된 이메일 아이디입니다.');
      setIsEmailChecked(false);
    } else {
      alert('사용 가능한 이메일입니다!');
      setIsEmailChecked(true);
      setEmailError('');
    }
  };

  // 비밀번호 실시간 검증
  useEffect(() => {
    if (!password || !confirmPassword) {
      setPasswordFeedback({ message: '', isValid: false });
      return;
    }

    if (password.length < 8) {
      setPasswordFeedback({ message: '비밀번호는 최소 8자 이상이어야 합니다.', isValid: false });
      return;
    }

    if (password === confirmPassword) {
      setPasswordFeedback({ message: '비밀번호가 일치합니다.', isValid: true });
    } else {
      setPasswordFeedback({ message: '비밀번호가 일치하지 않습니다.', isValid: false });
    }
  }, [password, confirmPassword]);

  // 대학교 메일 형식 체크 (고려대학교 도메인만 체크)
  const validateSchoolEmail = (value) => {
    const schoolRegex = /^[a-zA-Z0-9._%+-]+@(mail\.)?korea\.ac\.kr$/i;
    if (!value) {
      setSchoolEmailError('학교 이메일을 입력해주세요.');
      return false;
    }
    if (!schoolRegex.test(value)) {
      setSchoolEmailError('고려대학교 메일(@korea.ac.kr 또는 @mail.korea.ac.kr)만 등록 가능합니다.');
      return false;
    }
    setSchoolEmailError('');
    return true;
  };

  // 인증번호 발송 & 3분 타이머 가동
  const handleSendCode = () => {
    if (!validateSchoolEmail(schoolEmail)) return;

    // 6자리 임의 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setIsMailSent(true);
    setUserCode('');
    setIsMailVerified(false);
    
    // 타이머 리셋 및 가동
    setTimeLeft(180);
    setIsTimerActive(true);

    alert(`📨 학교 메일로 인증번호가 발송되었습니다!\n\n[테스트용 인증번호: ${code}]`);
  };

  // 타이머 카운트다운 로직
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerActive, timeLeft]);

  // 인증번호 확인 검증
  const handleVerifyCode = () => {
    if (timeLeft === 0) {
      alert('인증 시간이 만료되었습니다. 인증번호를 다시 발송해주세요.');
      return;
    }

    if (userCode === sentCode) {
      setIsMailVerified(true);
      setIsTimerActive(false);
      clearInterval(timerRef.current);
      alert('🎉 학교 메일 인증에 성공했습니다!');
    } else {
      alert('인증번호가 일치하지 않습니다. 다시 입력해주세요.');
      setIsMailVerified(false);
    }
  };

  // 타이머 시간 포맷 (03:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 최종 가입 신청
  const handleRegister = (e) => {
    e.preventDefault();
    if (!isEmailChecked) return alert('아이디 중복 확인을 완료해주세요.');
    if (!passwordFeedback.isValid) return alert('비밀번호 설정을 다시 확인해주세요.');
    if (!isMailVerified) return alert('학교 이메일 인증을 완료해주세요.');

    const registeredUser = {
      email,
      schoolEmail,
      department: '사학과'
    };

    if (onRegisterSuccess) {
      onRegisterSuccess(registeredUser);
    } else {
      alert('🎉 회원가입이 성공적으로 완료되었습니다!');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-5 space-y-6">
      <h2 className="text-lg font-extrabold text-slate-800 border-b pb-2">👤 회원가입</h2>
      
      <form onSubmit={handleRegister} className="space-y-5">
        {/* 1. Email ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">이메일 아이디</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              disabled={isEmailChecked}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              placeholder="name@example.com"
              className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none focus:border-red-500 disabled:bg-slate-50"
            />
            <button
              type="button"
              onClick={handleDuplicateCheck}
              disabled={isEmailChecked || !email}
              className="px-4 rounded-2xl text-xs font-bold bg-slate-900 text-white active:scale-95 transition-all shrink-0"
            >
              {isEmailChecked ? '✓ 확인완료' : '중복 확인'}
            </button>
          </div>
          {emailError && <p className="text-[10px] text-red-500 font-bold">{emailError}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-750">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="최소 8자 이상"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-500 outline-none text-sm"
          />
        </div>

        {/* Password Confirm */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-750">비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 다시 입력"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-500 outline-none text-sm"
          />
          {passwordFeedback.message && (
            <p className={`text-[10px] font-bold ${passwordFeedback.isValid ? 'text-emerald-600' : 'text-red-500'}`}>
              {passwordFeedback.message}
            </p>
          )}
        </div>

        {/* School Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-750">고려대 웹메일 계정 인증</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={schoolEmail}
              disabled={isMailVerified}
              onChange={(e) => {
                setSchoolEmail(e.target.value);
                if (schoolEmailError) validateSchoolEmail(e.target.value);
              }}
              placeholder="id@korea.ac.kr"
              className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none focus:border-red-500 disabled:bg-slate-50"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isMailVerified || !schoolEmail}
              className="px-4 rounded-2xl text-xs font-bold bg-red-750 hover:bg-red-800 text-white active:scale-95 transition-all shrink-0"
            >
              {isMailSent ? '재발송' : '인증코드 발송'}
            </button>
          </div>
          {schoolEmailError && <p className="text-[10px] text-red-500 font-bold">{schoolEmailError}</p>}
        </div>

        {/* Verification Code */}
        {isMailSent && (
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">인증번호 6자리</label>
              <span className="text-xs font-bold text-red-750">⏱️ {formatTime(timeLeft)}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={userCode}
                disabled={isMailVerified || timeLeft === 0}
                onChange={(e) => setUserCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="인증번호 입력"
                className="flex-1 px-4 py-3 rounded-2xl border text-sm font-bold tracking-widest text-center outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={isMailVerified || userCode.length !== 6 || timeLeft === 0}
                className="px-4 rounded-2xl text-xs font-bold bg-slate-900 text-white active:scale-95 transition-all shrink-0"
              >
                {isMailVerified ? '인증완료' : '인증 확인'}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isEmailChecked || !passwordFeedback.isValid || !isMailVerified}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
            isEmailChecked && passwordFeedback.isValid && isMailVerified
              ? 'bg-red-750 hover:bg-red-800 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          가입하기
        </button>
      </form>
    </div>
  );
}
