import React from 'react';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-3">
        <h1 className="text-2xl font-black text-slate-900">
          {statusCode ? `Error ${statusCode}` : 'Workstation Error'}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {statusCode === 404
            ? 'The requested EMX resource or page was not found.'
            : 'An unexpected exception occurred.'}
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
