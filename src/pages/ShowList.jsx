import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Clock, IndianRupee } from "lucide-react";
import { fetchShowsByMovie, clearShows } from "../store/slices/showSlice";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { formatOverlayMessage } from "../utils/overlayMessageUtil";

export default function ShowList() {
  const { id, title } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: shows, status, error } = useSelector((s) => s.shows);

  useEffect(() => {
    if (id) dispatch(fetchShowsByMovie(id));
    return () => dispatch(clearShows());
  }, [dispatch, id]);

  const BackButton = () => (
    <button
      onClick={() => navigate("/")}
      className="mt-6 px-5 py-2 rounded-lg font-medium shadow 
                 bg-navy-600 text-white hover:bg-navy-700 
                 dark:bg-navy-700 dark:hover:bg-navy-600 transition"
    >
      ⬅ Back to Home
    </button>
  );

  // 🌀 Loading overlay
  if (status === "loading") {
    return <LoadingOverlay message="Fetching available shows..." />;
  }

  // ❌ Error overlay
  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
          {formatOverlayMessage(error, "showlist")}
        </p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 relative">
      <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
        🎬 Available Shows for {title}
      </h2>

      {/* No shows */}
      {status === "succeeded" && shows.length === 0 && (
        <div className="text-center py-10 bg-gray-50 dark:bg-navy-900 rounded-2xl shadow-md relative z-10">
          <p className="text-lg font-semibold text-navy-700 dark:text-gray-100 mb-2">
            No shows available right now
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please check back later for new schedules.
          </p>
          <BackButton />
        </div>
      )}

      {/* Shows list */}
      {status === "succeeded" && shows.length > 0 && (
        <div className="space-y-6 relative z-10">
          {shows.map((show) => (
            <div
              key={show.id}
              className="bg-white dark:bg-navy-900 rounded-2xl shadow-md p-6 
                         border-l-4 border-navy-500 dark:border-navy-700 
                         hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-navy-700 dark:text-gray-100">
                {show.theatreName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                <MapPin size={14} /> {show.location}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {show.hallName}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/movie/${id}/shows/${show.id}/book`}
                  state={{
                    hall: show.hallName,
                    theatre: show.theatreName,
                    location: `${show.theatreAddress}, ${show.theatreCity}`,
                    startTime: show.startTime,
                    endTime: show.endTime,
                    movieId: id,
                    movieTitle: title,
                    price: show.price,
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium shadow 
                             bg-gray-100 text-gray-700 hover:bg-navy-600 hover:text-white 
                             dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-600 transition"
                >
                  <Clock size={14} className="inline mr-1" />
                  {new Date(show.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(show.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Link>

                <span className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <IndianRupee size={14} className="mr-1" />
                  {show.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
