import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <div className="h-screen bg-gray-100 text-gray-900 flex justify-center">
        <div className="max-w-screen m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
          <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
            <div
              className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/assets/images/png1.png')",
              }}
            ></div>
          </div>
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex items-center justify-center md:scale-150">
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
